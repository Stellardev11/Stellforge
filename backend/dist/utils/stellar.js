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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StellarSdk = exports.createStellarAsset = exports.fundTestnetAccount = exports.formatAmount = exports.validateAsset = exports.getAsset = exports.getNetworkPassphrase = exports.getServer = void 0;
const StellarSdk = __importStar(require("@stellar/stellar-sdk"));
exports.StellarSdk = StellarSdk;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const getServer = () => {
    const network = process.env.STELLAR_NETWORK || 'mainnet';
    const isTestnet = network === 'testnet';
    const horizonUrl = process.env.STELLAR_HORIZON_URL ||
        (isTestnet
            ? 'https://horizon-testnet.stellar.org'
            : 'https://horizon.stellar.org');
    return new StellarSdk.Horizon.Server(horizonUrl);
};
exports.getServer = getServer;
const getNetworkPassphrase = () => {
    const network = process.env.STELLAR_NETWORK || 'mainnet';
    return network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC;
};
exports.getNetworkPassphrase = getNetworkPassphrase;
const getAsset = (code, issuer) => {
    if (code === 'XLM' || issuer === 'native') {
        return stellar_sdk_1.Asset.native();
    }
    return new stellar_sdk_1.Asset(code, issuer);
};
exports.getAsset = getAsset;
const validateAsset = (code, issuer) => {
    try {
        if (!code || code.length === 0 || code.length > 12) {
            return false;
        }
        if (code === 'XLM' && issuer === 'native') {
            return true;
        }
        if (!issuer || issuer.length !== 56) {
            return false;
        }
        const asset = new stellar_sdk_1.Asset(code, issuer);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.validateAsset = validateAsset;
const formatAmount = (amount, decimals = 7) => {
    try {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) {
            return '0';
        }
        return num.toFixed(decimals).replace(/\.?0+$/, '');
    }
    catch (error) {
        return '0';
    }
};
exports.formatAmount = formatAmount;
const fundTestnetAccount = async (publicKey) => {
    if (process.env.STELLAR_NETWORK !== 'testnet') {
        throw new Error('Funding only available on testnet');
    }
    try {
        const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
        return response.ok;
    }
    catch (error) {
        console.error('Friendbot funding error:', error);
        return false;
    }
};
exports.fundTestnetAccount = fundTestnetAccount;
const createStellarAsset = async (params) => {
    const { assetCode, issuerPublicKey, distributorKeypair, amount } = params;
    const server = (0, exports.getServer)();
    const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
    const account = await server.loadAccount(distributorKeypair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: (0, exports.getNetworkPassphrase)(),
    })
        .addOperation(StellarSdk.Operation.changeTrust({
        asset: asset,
        limit: amount
    }))
        .addOperation(StellarSdk.Operation.payment({
        destination: distributorKeypair.publicKey(),
        asset: asset,
        amount: amount
    }))
        .setTimeout(30)
        .build();
    transaction.sign(distributorKeypair);
    const result = await server.submitTransaction(transaction);
    return result;
};
exports.createStellarAsset = createStellarAsset;
