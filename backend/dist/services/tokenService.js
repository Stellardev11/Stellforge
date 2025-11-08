"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferTokens = exports.burnTokens = exports.mintTokens = exports.getTokenInfo = exports.createToken = void 0;
const stellar_1 = require("../utils/stellar");
const createToken = async (params) => {
    const { symbol, totalSupply, distributorPublicKey } = params;
    const issuerKeypair = stellar_1.StellarSdk.Keypair.random();
    if (process.env.STELLAR_NETWORK === 'testnet') {
        await (0, stellar_1.fundTestnetAccount)(issuerKeypair.publicKey());
        await (0, stellar_1.fundTestnetAccount)(distributorPublicKey);
    }
    const server = (0, stellar_1.getServer)();
    const asset = new stellar_1.StellarSdk.Asset(symbol, issuerKeypair.publicKey());
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    const distributorAccount = await server.loadAccount(distributorPublicKey);
    const trustTransaction = new stellar_1.StellarSdk.TransactionBuilder(distributorAccount, {
        fee: stellar_1.StellarSdk.BASE_FEE,
        networkPassphrase: (0, stellar_1.getNetworkPassphrase)(),
    })
        .addOperation(stellar_1.StellarSdk.Operation.changeTrust({
        asset: asset,
        limit: totalSupply || '922337203685.4775807'
    }))
        .setTimeout(30)
        .build();
    const paymentTransaction = new stellar_1.StellarSdk.TransactionBuilder(issuerAccount, {
        fee: stellar_1.StellarSdk.BASE_FEE,
        networkPassphrase: (0, stellar_1.getNetworkPassphrase)(),
    })
        .addOperation(stellar_1.StellarSdk.Operation.payment({
        destination: distributorPublicKey,
        asset: asset,
        amount: totalSupply
    }))
        .setTimeout(30)
        .build();
    paymentTransaction.sign(issuerKeypair);
    const paymentResult = await server.submitTransaction(paymentTransaction);
    return {
        assetCode: symbol,
        issuerPublicKey: issuerKeypair.publicKey(),
        issuerSecretKey: issuerKeypair.secret(),
        transactionHash: paymentResult.hash,
        trustlineTransaction: trustTransaction.toEnvelope().toXDR('base64'),
        ...params
    };
};
exports.createToken = createToken;
const getTokenInfo = async (assetCode, issuer) => {
    const server = (0, stellar_1.getServer)();
    const asset = new stellar_1.StellarSdk.Asset(assetCode, issuer);
    try {
        const assetInfo = await server.assets()
            .forCode(assetCode)
            .forIssuer(issuer)
            .call();
        return {
            assetCode,
            issuer,
            records: assetInfo.records
        };
    }
    catch (error) {
        throw new Error(`Token not found: ${assetCode}`);
    }
};
exports.getTokenInfo = getTokenInfo;
const mintTokens = async (params) => {
    const { assetCode, issuerSecret, destination, amount } = params;
    const issuerKeypair = stellar_1.StellarSdk.Keypair.fromSecret(issuerSecret);
    const server = (0, stellar_1.getServer)();
    const asset = new stellar_1.StellarSdk.Asset(assetCode, issuerKeypair.publicKey());
    const account = await server.loadAccount(issuerKeypair.publicKey());
    const transaction = new stellar_1.StellarSdk.TransactionBuilder(account, {
        fee: stellar_1.StellarSdk.BASE_FEE,
        networkPassphrase: (0, stellar_1.getNetworkPassphrase)(),
    })
        .addOperation(stellar_1.StellarSdk.Operation.payment({
        destination,
        asset,
        amount
    }))
        .setTimeout(30)
        .build();
    transaction.sign(issuerKeypair);
    const result = await server.submitTransaction(transaction);
    return {
        transactionHash: result.hash,
        amount,
        destination
    };
};
exports.mintTokens = mintTokens;
const burnTokens = async (params) => {
    const { assetCode, issuerPublicKey, fromSecret, amount } = params;
    const fromKeypair = stellar_1.StellarSdk.Keypair.fromSecret(fromSecret);
    const server = (0, stellar_1.getServer)();
    const asset = new stellar_1.StellarSdk.Asset(assetCode, issuerPublicKey);
    const account = await server.loadAccount(fromKeypair.publicKey());
    const transaction = new stellar_1.StellarSdk.TransactionBuilder(account, {
        fee: stellar_1.StellarSdk.BASE_FEE,
        networkPassphrase: (0, stellar_1.getNetworkPassphrase)(),
    })
        .addOperation(stellar_1.StellarSdk.Operation.payment({
        destination: issuerPublicKey,
        asset,
        amount
    }))
        .setTimeout(30)
        .build();
    transaction.sign(fromKeypair);
    const result = await server.submitTransaction(transaction);
    return {
        transactionHash: result.hash,
        amount
    };
};
exports.burnTokens = burnTokens;
const transferTokens = async (params) => {
    const { assetCode, issuerPublicKey, fromSecret, destination, amount } = params;
    const fromKeypair = stellar_1.StellarSdk.Keypair.fromSecret(fromSecret);
    const server = (0, stellar_1.getServer)();
    const asset = new stellar_1.StellarSdk.Asset(assetCode, issuerPublicKey);
    const account = await server.loadAccount(fromKeypair.publicKey());
    const transaction = new stellar_1.StellarSdk.TransactionBuilder(account, {
        fee: stellar_1.StellarSdk.BASE_FEE,
        networkPassphrase: (0, stellar_1.getNetworkPassphrase)(),
    })
        .addOperation(stellar_1.StellarSdk.Operation.payment({
        destination,
        asset,
        amount
    }))
        .setTimeout(30)
        .build();
    transaction.sign(fromKeypair);
    const result = await server.submitTransaction(transaction);
    return {
        transactionHash: result.hash,
        amount,
        destination
    };
};
exports.transferTokens = transferTokens;
