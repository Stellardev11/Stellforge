"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const liquidityService_1 = require("../services/liquidityService");
const router = express_1.default.Router();
router.get('/pools', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const pools = await (0, liquidityService_1.getActivePools)(limit);
        res.json({ success: true, pools });
    }
    catch (error) {
        console.error('Error fetching pools:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch liquidity pools'
        });
    }
});
router.get('/pools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await (0, liquidityService_1.getPoolDetails)(id);
        if (!pool) {
            return res.status(404).json({
                success: false,
                error: 'Pool not found'
            });
        }
        res.json({ success: true, pool });
    }
    catch (error) {
        console.error('Error fetching pool details:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch pool details'
        });
    }
});
router.get('/pools/for-asset/:assetCode/:assetIssuer', async (req, res) => {
    try {
        const { assetCode, assetIssuer } = req.params;
        const pools = await (0, liquidityService_1.getPoolsForAsset)(assetCode, assetIssuer);
        res.json({ success: true, pools });
    }
    catch (error) {
        console.error('Error fetching pools for asset:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch pools for asset'
        });
    }
});
router.post('/calculate-shares', async (req, res) => {
    try {
        const { poolId, tokenAAmount, tokenBAmount } = req.body;
        if (!poolId || !tokenAAmount || !tokenBAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }
        const pool = await (0, liquidityService_1.getPoolDetails)(poolId);
        if (!pool) {
            return res.status(404).json({
                success: false,
                error: 'Pool not found'
            });
        }
        const shares = (0, liquidityService_1.calculateLPShares)(pool, tokenAAmount, tokenBAmount);
        const poolShare = (0, liquidityService_1.calculatePoolShare)(shares, pool.total_shares);
        res.json({
            success: true,
            shares,
            poolShare: poolShare.toFixed(4),
            pool
        });
    }
    catch (error) {
        console.error('Error calculating shares:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to calculate LP shares'
        });
    }
});
router.get('/pool-price/:poolId', async (req, res) => {
    try {
        const { poolId } = req.params;
        const { fromAsset } = req.query;
        if (!fromAsset) {
            return res.status(400).json({
                success: false,
                error: 'fromAsset parameter is required'
            });
        }
        const pool = await (0, liquidityService_1.getPoolDetails)(poolId);
        if (!pool) {
            return res.status(404).json({
                success: false,
                error: 'Pool not found'
            });
        }
        const price = (0, liquidityService_1.estimatePoolPrice)(pool, fromAsset);
        res.json({
            success: true,
            price,
            pool
        });
    }
    catch (error) {
        console.error('Error estimating pool price:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to estimate pool price'
        });
    }
});
exports.default = router;
