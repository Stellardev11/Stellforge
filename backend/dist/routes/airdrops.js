"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/join', async (req, res, next) => {
    try {
        const { projectId, walletAddress, referredBy } = req.body;
        if (!projectId || !walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: projectId, walletAddress'
            });
        }
        const referralCode = `${projectId.toUpperCase()}-${walletAddress.slice(0, 6).toUpperCase()}`;
        res.json({
            success: true,
            message: 'Successfully joined airdrop event',
            data: {
                projectId,
                walletAddress,
                referralCode,
                referredBy: referredBy || null,
                entries: 1,
                joinedAt: new Date()
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/list', async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: []
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/progress/:walletAddress', async (req, res, next) => {
    try {
        const { walletAddress } = req.params;
        res.json({
            success: true,
            data: {
                projects: []
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/claim', async (req, res, next) => {
    try {
        const { projectId, walletAddress } = req.body;
        if (!projectId || !walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: projectId, walletAddress'
            });
        }
        res.json({
            success: true,
            message: 'Tokens claimed successfully',
            data: {
                projectId,
                walletAddress,
                tokensClaimed: 12000,
                transactionHash: 'mock_tx_hash_' + Date.now()
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
