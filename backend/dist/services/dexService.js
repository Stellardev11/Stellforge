"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeHistory = exports.calculateSlippage = exports.getOrderbook = exports.findBestPath = exports.getSwapQuote = void 0;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const stellar_1 = require("../utils/stellar");
const getSwapQuote = async (fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount, mode = 'send') => {
    try {
        const server = (0, stellar_1.getServer)();
        const sourceAsset = (0, stellar_1.getAsset)(fromAssetCode, fromAssetIssuer);
        const destAsset = (0, stellar_1.getAsset)(toAssetCode, toAssetIssuer);
        let pathsResponse;
        if (mode === 'send') {
            pathsResponse = await server
                .strictSendPaths(sourceAsset, amount, [destAsset])
                .call();
        }
        else {
            pathsResponse = await server
                .strictReceivePaths([sourceAsset], destAsset, amount)
                .call();
        }
        if (!pathsResponse.records || pathsResponse.records.length === 0) {
            throw new Error('No path found for this swap');
        }
        const bestPath = pathsResponse.records[0];
        const sourceAmount = mode === 'send' ? amount : bestPath.source_amount;
        const destAmount = mode === 'send' ? bestPath.destination_amount : amount;
        const price = (parseFloat(destAmount) / parseFloat(sourceAmount)).toFixed(7);
        const path = bestPath.path.map((p) => {
            if (p.asset_type === 'native') {
                return stellar_sdk_1.Asset.native();
            }
            return new stellar_sdk_1.Asset(p.asset_code, p.asset_issuer);
        });
        const slippage = (0, exports.calculateSlippage)(pathsResponse.records);
        return {
            sourceAmount,
            destinationAmount: destAmount,
            path,
            price,
            slippage
        };
    }
    catch (error) {
        console.error('Error getting swap quote:', error);
        throw new Error('Failed to get swap quote from Stellar network');
    }
};
exports.getSwapQuote = getSwapQuote;
const findBestPath = async (fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount) => {
    try {
        const server = (0, stellar_1.getServer)();
        const sourceAsset = (0, stellar_1.getAsset)(fromAssetCode, fromAssetIssuer);
        const destAsset = (0, stellar_1.getAsset)(toAssetCode, toAssetIssuer);
        const pathsResponse = await server
            .strictSendPaths(sourceAsset, amount, [destAsset])
            .call();
        if (!pathsResponse.records || pathsResponse.records.length === 0) {
            return [];
        }
        const bestPath = pathsResponse.records[0];
        const path = bestPath.path.map((p) => {
            if (p.asset_type === 'native') {
                return stellar_sdk_1.Asset.native();
            }
            return new stellar_sdk_1.Asset(p.asset_code, p.asset_issuer);
        });
        return path;
    }
    catch (error) {
        console.error('Error finding best path:', error);
        throw new Error('Failed to find trading path on Stellar network');
    }
};
exports.findBestPath = findBestPath;
const getOrderbook = async (sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, limit = 20) => {
    try {
        const server = (0, stellar_1.getServer)();
        const sellingAsset = (0, stellar_1.getAsset)(sellingAssetCode, sellingAssetIssuer);
        const buyingAsset = (0, stellar_1.getAsset)(buyingAssetCode, buyingAssetIssuer);
        const orderbookResponse = await server
            .orderbook(sellingAsset, buyingAsset)
            .limit(limit)
            .call();
        const bids = orderbookResponse.bids.map((bid) => ({
            price: bid.price,
            amount: bid.amount
        }));
        const asks = orderbookResponse.asks.map((ask) => ({
            price: ask.price,
            amount: ask.amount
        }));
        return {
            bids,
            asks,
            base: {
                code: sellingAssetCode,
                issuer: sellingAssetIssuer
            },
            counter: {
                code: buyingAssetCode,
                issuer: buyingAssetIssuer
            }
        };
    }
    catch (error) {
        console.error('Error fetching orderbook:', error);
        throw new Error('Failed to fetch orderbook from Stellar network');
    }
};
exports.getOrderbook = getOrderbook;
const calculateSlippage = (paths) => {
    if (!paths || paths.length < 2) {
        return 0;
    }
    try {
        const bestRate = parseFloat(paths[0].destination_amount) / parseFloat(paths[0].source_amount);
        const worstRate = parseFloat(paths[paths.length - 1].destination_amount) / parseFloat(paths[paths.length - 1].source_amount);
        const slippage = ((bestRate - worstRate) / bestRate) * 100;
        return Math.max(0, Math.min(slippage, 100));
    }
    catch (error) {
        console.error('Error calculating slippage:', error);
        return 0;
    }
};
exports.calculateSlippage = calculateSlippage;
const getTradeHistory = async (baseAssetCode, baseAssetIssuer, counterAssetCode, counterAssetIssuer, limit = 50) => {
    try {
        const server = (0, stellar_1.getServer)();
        const baseAsset = (0, stellar_1.getAsset)(baseAssetCode, baseAssetIssuer);
        const counterAsset = (0, stellar_1.getAsset)(counterAssetCode, counterAssetIssuer);
        const tradesResponse = await server
            .trades()
            .forAssetPair(baseAsset, counterAsset)
            .order('desc')
            .limit(limit)
            .call();
        return tradesResponse.records.map((trade) => ({
            id: trade.id,
            ledger: trade.ledger_close_time,
            price: trade.price,
            baseAmount: trade.base_amount,
            counterAmount: trade.counter_amount,
            type: trade.base_is_seller ? 'sell' : 'buy'
        }));
    }
    catch (error) {
        console.error('Error fetching trade history:', error);
        throw new Error('Failed to fetch trade history from Stellar network');
    }
};
exports.getTradeHistory = getTradeHistory;
