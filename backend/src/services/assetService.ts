import { Horizon } from '@stellar/stellar-sdk';
import { getServer } from '../utils/stellar';
import { enrichAssetsWithVerification } from './assetLogoService';

interface AssetInfo {
  asset_code: string;
  asset_issuer: string;
  asset_type: string;
  domain?: string;
  image?: string;
  verified?: boolean;
  supply?: string;
  num_accounts?: number;
  amount?: string;
  flags?: {
    auth_required?: boolean;
    auth_revocable?: boolean;
    auth_immutable?: boolean;
  };
}

interface AssetCache {
  data: AssetInfo[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
let popularAssetsCache: AssetCache | null = null;

const TOP_VERIFIED_ASSETS = [
  {
    asset_code: 'USDC',
    asset_issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    domain: 'centre.io',
  },
  {
    asset_code: 'AQUA',
    asset_issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    domain: 'aqua.network',
  },
  {
    asset_code: 'yUSDC',
    asset_issuer: 'GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF',
    domain: 'ultrastellar.com',
  },
  {
    asset_code: 'USDT',
    asset_issuer: 'GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V',
    domain: 'tether.to',
  }
];

async function fetchHomeDomain(issuer: string): Promise<string | undefined> {
  try {
    const server = getServer();
    const account = await server.accounts().accountId(issuer).call();
    return account.home_domain || undefined;
  } catch (error) {
    console.log(`Could not fetch home_domain for ${issuer}`);
    return undefined;
  }
}

export const fetchPopularAssets = async (limit: number = 20): Promise<AssetInfo[]> => {
  if (popularAssetsCache && Date.now() - popularAssetsCache.timestamp < CACHE_DURATION) {
    return popularAssetsCache.data.slice(0, limit);
  }

  try {
    const server = getServer();
    const xlm: AssetInfo = {
      asset_code: 'XLM',
      asset_issuer: 'native',
      asset_type: 'native',
      domain: 'stellar.org',
      supply: '50000000000',
      num_accounts: 10000000,
      verified: true,
    };

    const verifiedAssets: AssetInfo[] = [];
    
    for (const topAsset of TOP_VERIFIED_ASSETS) {
      try {
        const assetResponse = await server
          .assets()
          .forCode(topAsset.asset_code)
          .forIssuer(topAsset.asset_issuer)
          .limit(1)
          .call();

        if (assetResponse.records.length > 0) {
          const asset = assetResponse.records[0];
          verifiedAssets.push({
            asset_code: asset.asset_code,
            asset_issuer: asset.asset_issuer,
            asset_type: asset.asset_type,
            domain: topAsset.domain,
            supply: asset.amount,
            num_accounts: asset.num_accounts,
            verified: true,
            flags: {
              auth_required: asset.flags?.auth_required,
              auth_revocable: asset.flags?.auth_revocable,
              auth_immutable: asset.flags?.auth_immutable,
            }
          });
        }
      } catch (err) {
        console.log(`Could not fetch ${topAsset.asset_code}, skipping...`);
      }
    }

    const assetsResponse = await server
      .assets()
      .order('desc')
      .limit(200)
      .call();

    const candidateAssets: AssetInfo[] = [];

    for (const asset of assetsResponse.records) {
      const isAlreadyVerified = TOP_VERIFIED_ASSETS.some(
        va => va.asset_code === asset.asset_code && va.asset_issuer === asset.asset_issuer
      );
      
      if (isAlreadyVerified) continue;

      const domain = await fetchHomeDomain(asset.asset_issuer);
      
      if (domain) {
        candidateAssets.push({
          asset_code: asset.asset_code,
          asset_issuer: asset.asset_issuer,
          asset_type: asset.asset_type,
          domain,
          supply: asset.amount,
          num_accounts: asset.num_accounts,
          flags: {
            auth_required: asset.flags?.auth_required,
            auth_revocable: asset.flags?.auth_revocable,
            auth_immutable: asset.flags?.auth_immutable,
          }
        });
      }
    }

    candidateAssets.sort((a: AssetInfo, b: AssetInfo) => {
      const aAccounts = a.num_accounts || 0;
      const bAccounts = b.num_accounts || 0;
      return bAccounts - aAccounts;
    });

    const enrichedCandidates = await enrichAssetsWithVerification(candidateAssets);
    
    const verifiedCandidates = enrichedCandidates
      .filter(asset => asset.verified === true)
      .slice(0, Math.max(0, limit - verifiedAssets.length - 1));
    
    const result = [xlm, ...verifiedAssets, ...verifiedCandidates];
    
    popularAssetsCache = {
      data: result,
      timestamp: Date.now()
    };

    return result;
  } catch (error) {
    console.error('Error fetching popular assets:', error);
    throw new Error('Failed to fetch popular assets from Stellar network');
  }
};

export const searchAssets = async (query: string): Promise<AssetInfo[]> => {
  if (!query || query.length < 1) {
    return [];
  }

  try {
    const server = getServer();
    const upperQuery = query.toUpperCase();

    if (upperQuery === 'XLM') {
      const xlm: AssetInfo = {
        asset_code: 'XLM',
        asset_issuer: 'native',
        asset_type: 'native',
        domain: 'stellar.org',
        verified: true,
      };
      return [xlm];
    }

    let assetsResponse;
    const isIssuerAddress = /^G[A-Z0-9]{55}$/.test(query);

    if (isIssuerAddress) {
      assetsResponse = await server
        .assets()
        .forIssuer(query)
        .limit(50)
        .call();
    } else {
      assetsResponse = await server
        .assets()
        .forCode(upperQuery)
        .limit(50)
        .call();
    }

    const assetsWithDomains: AssetInfo[] = [];

    for (const asset of assetsResponse.records) {
      const domain = await fetchHomeDomain(asset.asset_issuer);
      
      assetsWithDomains.push({
        asset_code: asset.asset_code,
        asset_issuer: asset.asset_issuer,
        asset_type: asset.asset_type,
        domain,
        supply: asset.amount,
        num_accounts: asset.num_accounts,
        flags: {
          auth_required: asset.flags?.auth_required,
          auth_revocable: asset.flags?.auth_revocable,
          auth_immutable: asset.flags?.auth_immutable,
        }
      });
    }

    const enrichedAssets = await enrichAssetsWithVerification(assetsWithDomains);

    return enrichedAssets.sort((a, b) => {
      if (a.verified !== b.verified) {
        return a.verified ? -1 : 1;
      }
      const aAccounts = a.num_accounts || 0;
      const bAccounts = b.num_accounts || 0;
      return bAccounts - aAccounts;
    });
  } catch (error) {
    console.error('Error searching assets:', error);
    throw new Error('Failed to search assets on Stellar network');
  }
};

export const getAssetDetails = async (code: string, issuer: string): Promise<AssetInfo | null> => {
  try {
    if (code === 'XLM' || issuer === 'native') {
      return {
        asset_code: 'XLM',
        asset_issuer: 'native',
        asset_type: 'native',
        domain: 'stellar.org',
        supply: '50000000000',
        num_accounts: 10000000,
      };
    }

    const server = getServer();
    const assetsResponse = await server
      .assets()
      .forCode(code)
      .forIssuer(issuer)
      .limit(1)
      .call();

    if (assetsResponse.records.length === 0) {
      return null;
    }

    const asset = assetsResponse.records[0];
    
    return {
      asset_code: asset.asset_code,
      asset_issuer: asset.asset_issuer,
      asset_type: asset.asset_type,
      domain: undefined,
      supply: asset.amount,
      num_accounts: asset.num_accounts,
      flags: {
        auth_required: asset.flags?.auth_required,
        auth_revocable: asset.flags?.auth_revocable,
        auth_immutable: asset.flags?.auth_immutable,
      }
    };
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw new Error('Failed to fetch asset details from Stellar network');
  }
};

export const clearCache = (): void => {
  popularAssetsCache = null;
};
