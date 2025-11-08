"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePoolShare = exports.estimatePoolPrice = exports.getPoolsForAsset = exports.calculateLPShares = exports.getPoolDetails = exports.getActivePools = void 0;
const stellar_1 = require("../utils/stellar");
const getActivePools = async (limit = 50) => {
    try {
        const server = (0, stellar_1.getServer)();
        const poolsResponse = await server
            .liquidityPools()
            .limit(limit)
            .order('desc')
            .call();
        const pools = poolsResponse.records.map((pool) => ({
            id: pool.id,
            fee_bp: pool.fee_bp,
            type: pool.type,
            total_shares: pool.total_shares,
            total_trustlines: pool.total_trustlines,
            reserves: pool.reserves.map((reserve) => ({
                asset: reserve.asset === 'native' ? 'native' : reserve.asset,
                amount: reserve.amount
            }))
        }));
        return pools;
    }
    catch (error) {
        console.error('Error fetching active pools:', error);
        throw new Error('Failed to fetch liquidity pools from Stellar network');
    }
};
exports.getActivePools = getActivePools;
const getPoolDetails = async (poolId) => {
    try {
        const server = (0, stellar_1.getServer)();
        const pool = await server.liquidityPools().liquidityPoolId(poolId).call();
        if (!pool) {
            return null;
        }
        const reserves = pool.reserves;
        const assetA = reserves[0].asset === 'native'
            ? { code: 'XLM', issuer: 'native' }
            : {
                code: reserves[0].asset.split(':')[0],
                issuer: reserves[0].asset.split(':')[1]
            };
        const assetB = reserves[1].asset === 'native'
            ? { code: 'XLM', issuer: 'native' }
            : {
                code: reserves[1].asset.split(':')[0],
                issuer: reserves[1].asset.split(':')[1]
            };
        return {
            id: pool.id,
            paging_token: pool.paging_token,
            fee_bp: pool.fee_bp,
            type: pool.type,
            total_shares: pool.total_shares,
            total_trustlines: pool.total_trustlines,
            reserves: pool.reserves.map((reserve) => ({
                asset: reserve.asset === 'native' ? 'XLM' : reserve.asset,
                amount: reserve.amount
            })),
            asset_a: assetA,
            asset_b: assetB
        };
    }
    catch (error) {
        console.error('Error fetching pool details:', error);
        throw new Error('Failed to fetch pool details from Stellar network');
    }
};
exports.getPoolDetails = getPoolDetails;
const calculateLPShares = (pool, tokenAAmount, tokenBAmount) => {
    try {
        const reserveA = parseFloat(pool.reserves[0].amount);
        const reserveB = parseFloat(pool.reserves[1].amount);
        const totalShares = parseFloat(pool.total_shares);
        const amountA = parseFloat(tokenAAmount);
        const amountB = parseFloat(tokenBAmount);
        if (totalShares === 0) {
            return Math.sqrt(amountA * amountB).toFixed(7);
        }
        const sharesFromA = (amountA / reserveA) * totalShares;
        const sharesFromB = (amountB / reserveB) * totalShares;
        const shares = Math.min(sharesFromA, sharesFromB);
        return shares.toFixed(7);
    }
    catch (error) {
        console.error('Error calculating LP shares:', error);
        throw new Error('Failed to calculate LP shares');
    }
};
exports.calculateLPShares = calculateLPShares;
const getPoolsForAsset = async (assetCode, assetIssuer) => {
    try {
        const server = (0, stellar_1.getServer)();
        const asset = (0, stellar_1.getAsset)(assetCode, assetIssuer);
        const poolsResponse = await server
            .liquidityPools()
            .forAssets(asset)
            .limit(100)
            .call();
        const pools = poolsResponse.records.map((pool) => ({
            id: pool.id,
            fee_bp: pool.fee_bp,
            type: pool.type,
            total_shares: pool.total_shares,
            total_trustlines: pool.total_trustlines,
            reserves: pool.reserves.map((reserve) => ({
                asset: reserve.asset === 'native' ? 'XLM' : reserve.asset,
                amount: reserve.amount
            }))
        }));
        return pools;
    }
    catch (error) {
        console.error('Error fetching pools for asset:', error);
        throw new Error('Failed to fetch pools for asset from Stellar network');
    }
};
exports.getPoolsForAsset = getPoolsForAsset;
const estimatePoolPrice = (pool, fromAsset) => {
    try {
        const reserve0Asset = pool.reserves[0].asset;
        const reserve0Amount = parseFloat(pool.reserves[0].amount);
        const reserve1Amount = parseFloat(pool.reserves[1].amount);
        if (reserve0Asset.includes(fromAsset) || reserve0Asset === fromAsset) {
            return (reserve1Amount / reserve0Amount).toFixed(7);
        }
        else {
            return (reserve0Amount / reserve1Amount).toFixed(7);
        }
    }
    catch (error) {
        console.error('Error estimating pool price:', error);
        return '0';
    }
};
exports.estimatePoolPrice = estimatePoolPrice;
const calculatePoolShare = (userShares, totalShares) => {
    try {
        const shares = parseFloat(userShares);
        const total = parseFloat(totalShares);
        if (total === 0)
            return 0;
        return (shares / total) * 100;
    }
    catch (error) {
        console.error('Error calculating pool share:', error);
        return 0;
    }
};
exports.calculatePoolShare = calculatePoolShare;
