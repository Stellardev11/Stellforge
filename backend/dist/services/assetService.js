"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.getAssetDetails = exports.searchAssets = exports.fetchPopularAssets = void 0;
const stellar_1 = require("../utils/stellar");
const assetLogoService_1 = require("./assetLogoService");
const CACHE_DURATION = 5 * 60 * 1000;
let popularAssetsCache = null;
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
async function fetchHomeDomain(issuer) {
    try {
        const server = (0, stellar_1.getServer)();
        const account = await server.accounts().accountId(issuer).call();
        return account.home_domain || undefined;
    }
    catch (error) {
        console.log(`Could not fetch home_domain for ${issuer}`);
        return undefined;
    }
}
const fetchPopularAssets = async (limit = 20) => {
    if (popularAssetsCache && Date.now() - popularAssetsCache.timestamp < CACHE_DURATION) {
        return popularAssetsCache.data.slice(0, limit);
    }
    try {
        const server = (0, stellar_1.getServer)();
        const xlm = {
            asset_code: 'XLM',
            asset_issuer: 'native',
            asset_type: 'native',
            domain: 'stellar.org',
            supply: '50000000000',
            num_accounts: 10000000,
            verified: true,
        };
        const verifiedAssets = [];
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
            }
            catch (err) {
                console.log(`Could not fetch ${topAsset.asset_code}, skipping...`);
            }
        }
        const assetsResponse = await server
            .assets()
            .order('desc')
            .limit(200)
            .call();
        const candidateAssets = [];
        for (const asset of assetsResponse.records) {
            const isAlreadyVerified = TOP_VERIFIED_ASSETS.some(va => va.asset_code === asset.asset_code && va.asset_issuer === asset.asset_issuer);
            if (isAlreadyVerified)
                continue;
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
        candidateAssets.sort((a, b) => {
            const aAccounts = a.num_accounts || 0;
            const bAccounts = b.num_accounts || 0;
            return bAccounts - aAccounts;
        });
        const enrichedCandidates = await (0, assetLogoService_1.enrichAssetsWithVerification)(candidateAssets);
        const verifiedCandidates = enrichedCandidates
            .filter(asset => asset.verified === true)
            .slice(0, Math.max(0, limit - verifiedAssets.length - 1));
        const result = [xlm, ...verifiedAssets, ...verifiedCandidates];
        popularAssetsCache = {
            data: result,
            timestamp: Date.now()
        };
        return result;
    }
    catch (error) {
        console.error('Error fetching popular assets:', error);
        throw new Error('Failed to fetch popular assets from Stellar network');
    }
};
exports.fetchPopularAssets = fetchPopularAssets;
const searchAssets = async (query) => {
    if (!query || query.length < 1) {
        return [];
    }
    try {
        const server = (0, stellar_1.getServer)();
        const upperQuery = query.toUpperCase();
        if (upperQuery === 'XLM') {
            const xlm = {
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
        }
        else {
            assetsResponse = await server
                .assets()
                .forCode(upperQuery)
                .limit(50)
                .call();
        }
        const assetsWithDomains = [];
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
        const enrichedAssets = await (0, assetLogoService_1.enrichAssetsWithVerification)(assetsWithDomains);
        return enrichedAssets.sort((a, b) => {
            if (a.verified !== b.verified) {
                return a.verified ? -1 : 1;
            }
            const aAccounts = a.num_accounts || 0;
            const bAccounts = b.num_accounts || 0;
            return bAccounts - aAccounts;
        });
    }
    catch (error) {
        console.error('Error searching assets:', error);
        throw new Error('Failed to search assets on Stellar network');
    }
};
exports.searchAssets = searchAssets;
const getAssetDetails = async (code, issuer) => {
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
        const server = (0, stellar_1.getServer)();
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
    }
    catch (error) {
        console.error('Error fetching asset details:', error);
        throw new Error('Failed to fetch asset details from Stellar network');
    }
};
exports.getAssetDetails = getAssetDetails;
const clearCache = () => {
    popularAssetsCache = null;
};
exports.clearCache = clearCache;
