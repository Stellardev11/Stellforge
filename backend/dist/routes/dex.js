"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assetService_1 = require("../services/assetService");
const dexService_1 = require("../services/dexService");
const transactionService_1 = require("../services/transactionService");
const router = express_1.default.Router();
router.get('/assets', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const assets = await (0, assetService_1.fetchPopularAssets)(limit);
        res.json({ success: true, assets });
    }
    catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch assets'
        });
    }
});
router.get('/assets/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        const assets = await (0, assetService_1.searchAssets)(query);
        res.json({ success: true, assets });
    }
    catch (error) {
        console.error('Error searching assets:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to search assets'
        });
    }
});
router.get('/assets/:code/:issuer', async (req, res) => {
    try {
        const { code, issuer } = req.params;
        const asset = await (0, assetService_1.getAssetDetails)(code, issuer);
        if (!asset) {
            return res.status(404).json({
                success: false,
                error: 'Asset not found'
            });
        }
        res.json({ success: true, asset });
    }
    catch (error) {
        console.error('Error fetching asset details:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch asset details'
        });
    }
});
router.get('/quote', async (req, res) => {
    try {
        const { fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount, mode } = req.query;
        if (!fromAssetCode || !fromAssetIssuer || !toAssetCode || !toAssetIssuer || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }
        const quote = await (0, dexService_1.getSwapQuote)(fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount, mode || 'send');
        res.json({ success: true, quote });
    }
    catch (error) {
        console.error('Error getting quote:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get swap quote'
        });
    }
});
router.get('/orderbook', async (req, res) => {
    try {
        const { sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, limit } = req.query;
        if (!sellingAssetCode || !sellingAssetIssuer || !buyingAssetCode || !buyingAssetIssuer) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }
        const orderbook = await (0, dexService_1.getOrderbook)(sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, limit ? parseInt(limit) : 20);
        res.json({ success: true, orderbook });
    }
    catch (error) {
        console.error('Error fetching orderbook:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch orderbook'
        });
    }
});
router.get('/path', async (req, res) => {
    try {
        const { fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount } = req.query;
        if (!fromAssetCode || !fromAssetIssuer || !toAssetCode || !toAssetIssuer || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }
        const path = await (0, dexService_1.findBestPath)(fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount);
        res.json({ success: true, path });
    }
    catch (error) {
        console.error('Error finding path:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to find trading path'
        });
    }
});
router.get('/trades', async (req, res) => {
    try {
        const { baseAssetCode, baseAssetIssuer, counterAssetCode, counterAssetIssuer, limit } = req.query;
        if (!baseAssetCode || !baseAssetIssuer || !counterAssetCode || !counterAssetIssuer) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }
        const trades = await (0, dexService_1.getTradeHistory)(baseAssetCode, baseAssetIssuer, counterAssetCode, counterAssetIssuer, limit ? parseInt(limit) : 50);
        res.json({ success: true, trades });
    }
    catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch trade history'
        });
    }
});
router.post('/submit', async (req, res) => {
    try {
        const { xdr } = req.body;
        if (!xdr) {
            return res.status(400).json({
                success: false,
                error: 'Transaction XDR is required'
            });
        }
        const validation = await (0, transactionService_1.validateTransaction)(xdr);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error || 'Invalid transaction'
            });
        }
        const result = await (0, transactionService_1.submitSignedTransaction)(xdr);
        res.json({ success: true, result });
    }
    catch (error) {
        console.error('Error submitting transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit transaction'
        });
    }
});
router.get('/transaction/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const status = await (0, transactionService_1.getTransactionStatus)(hash);
        res.json({ success: true, status });
    }
    catch (error) {
        console.error('Error fetching transaction status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch transaction status'
        });
    }
});
exports.default = router;
