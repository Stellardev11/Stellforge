import axios from 'axios';
import * as toml from '@iarna/toml';

interface TomlInfo {
  image?: string;
  orgLogo?: string;
  name?: string;
  desc?: string;
  verified?: boolean;
}

interface VerificationCache {
  [key: string]: {
    logo: string | null;
    verified: boolean;
    domain?: string;
    timestamp: number;
  };
}

const verificationCache: VerificationCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const KNOWN_ASSET_LOGOS: { [key: string]: string } = {
  'XLM:native': 'https://cryptologos.cc/logos/stellar-xlm-logo.png',
  'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  'USDT:GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA': 'https://aqua.network/assets/img/aqua-logo.png',
};

function isValidLogoUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== 'https:' && !url.startsWith('ipfs://')) {
      return false;
    }
    
    if (url.startsWith('data:')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export const fetchAssetVerification = async (
  assetCode: string,
  assetIssuer: string,
  domain?: string
): Promise<{ logo: string | null; verified: boolean; domain?: string }> => {
  const cacheKey = `${assetCode}:${assetIssuer}`;
  
  if (verificationCache[cacheKey] && Date.now() - verificationCache[cacheKey].timestamp < CACHE_DURATION) {
    return {
      logo: verificationCache[cacheKey].logo,
      verified: verificationCache[cacheKey].verified,
      domain: verificationCache[cacheKey].domain,
    };
  }

  if (KNOWN_ASSET_LOGOS[cacheKey]) {
    const logo = KNOWN_ASSET_LOGOS[cacheKey];
    verificationCache[cacheKey] = { logo, verified: true, domain, timestamp: Date.now() };
    return { logo, verified: true, domain };
  }

  try {
    if (domain) {
      const tomlInfo = await fetchTomlInfo(domain, assetCode, assetIssuer);
      if (tomlInfo?.image && isValidLogoUrl(tomlInfo.image)) {
        verificationCache[cacheKey] = { 
          logo: tomlInfo.image, 
          verified: true, 
          domain,
          timestamp: Date.now() 
        };
        return { logo: tomlInfo.image, verified: true, domain };
      }
    }

    verificationCache[cacheKey] = { logo: null, verified: false, timestamp: Date.now() };
    return { logo: null, verified: false };
  } catch (error) {
    console.log(`Could not verify ${assetCode}:${assetIssuer}`);
    verificationCache[cacheKey] = { logo: null, verified: false, timestamp: Date.now() };
    return { logo: null, verified: false };
  }
};

async function fetchTomlInfo(
  domain: string, 
  assetCode: string,
  assetIssuer: string
): Promise<TomlInfo | null> {
  try {
    const tomlUrl = `https://${domain}/.well-known/stellar.toml`;
    const response = await axios.get(tomlUrl, { 
      timeout: 5000,
      headers: {
        'Accept': 'text/plain, application/toml'
      },
      maxContentLength: 100000,
    });

    const parsed = toml.parse(response.data) as any;
    
    if (!parsed.CURRENCIES || !Array.isArray(parsed.CURRENCIES)) {
      return null;
    }

    const currency = parsed.CURRENCIES.find((c: any) => 
      c.code === assetCode && c.issuer === assetIssuer
    );

    if (!currency) {
      return null;
    }

    return {
      image: currency.image,
      orgLogo: currency.orgLogo,
      name: currency.name,
      desc: currency.desc,
      verified: true,
    };
  } catch (error) {
    console.log(`Failed to fetch TOML for ${domain}: ${error}`);
    return null;
  }
}

export const enrichAssetsWithVerification = async (assets: any[]): Promise<any[]> => {
  const enrichedAssets = await Promise.all(
    assets.map(async (asset) => {
      const verification = await fetchAssetVerification(
        asset.asset_code,
        asset.asset_issuer,
        asset.domain
      );

      return {
        ...asset,
        image: verification.logo,
        verified: verification.verified,
        toml_info: verification.logo ? { 
          image: verification.logo,
          verified: verification.verified 
        } : undefined,
      };
    })
  );

  return enrichedAssets;
};
