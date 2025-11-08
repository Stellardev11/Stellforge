"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichAssetsWithVerification = exports.fetchAssetVerification = void 0;
const axios_1 = __importDefault(require("axios"));
const toml = __importStar(require("@iarna/toml"));
const verificationCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const KNOWN_ASSET_LOGOS = {
    'XLM:native': 'https://cryptologos.cc/logos/stellar-xlm-logo.png',
    'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    'USDT:GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA': 'https://aqua.network/assets/img/aqua-logo.png',
};
function isValidLogoUrl(url) {
    if (!url)
        return false;
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' && !url.startsWith('ipfs://')) {
            return false;
        }
        if (url.startsWith('data:')) {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
const fetchAssetVerification = async (assetCode, assetIssuer, domain) => {
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
    }
    catch (error) {
        console.log(`Could not verify ${assetCode}:${assetIssuer}`);
        verificationCache[cacheKey] = { logo: null, verified: false, timestamp: Date.now() };
        return { logo: null, verified: false };
    }
};
exports.fetchAssetVerification = fetchAssetVerification;
async function fetchTomlInfo(domain, assetCode, assetIssuer) {
    try {
        const tomlUrl = `https://${domain}/.well-known/stellar.toml`;
        const response = await axios_1.default.get(tomlUrl, {
            timeout: 5000,
            headers: {
                'Accept': 'text/plain, application/toml'
            },
            maxContentLength: 100000,
        });
        const parsed = toml.parse(response.data);
        if (!parsed.CURRENCIES || !Array.isArray(parsed.CURRENCIES)) {
            return null;
        }
        const currency = parsed.CURRENCIES.find((c) => c.code === assetCode && c.issuer === assetIssuer);
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
    }
    catch (error) {
        console.log(`Failed to fetch TOML for ${domain}: ${error}`);
        return null;
    }
}
const enrichAssetsWithVerification = async (assets) => {
    const enrichedAssets = await Promise.all(assets.map(async (asset) => {
        const verification = await (0, exports.fetchAssetVerification)(asset.asset_code, asset.asset_issuer, asset.domain);
        return {
            ...asset,
            image: verification.logo,
            verified: verification.verified,
            toml_info: verification.logo ? {
                image: verification.logo,
                verified: verification.verified
            } : undefined,
        };
    }));
    return enrichedAssets;
};
exports.enrichAssetsWithVerification = enrichAssetsWithVerification;
