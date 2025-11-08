"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mintService_1 = require("../services/mintService");
const referralService_1 = require("../services/referralService");
const taskService_1 = require("../services/taskService");
const security_1 = require("../middleware/security");
const router = express_1.default.Router();
router.post('/mint', async (req, res) => {
    try {
        const { walletAddress, xlmAmount, transactionHash } = req.body;
        if (!walletAddress || !xlmAmount || !transactionHash) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await mintService_1.mintService.mintPoints(walletAddress, parseFloat(xlmAmount), transactionHash);
        await (0, security_1.logSecurityEvent)(req, 'MINT_POINTS', { walletAddress, xlmAmount, transactionHash });
        res.json({
            success: true,
            pSlfPoints: result.pSlfPoints,
            message: `Successfully minted ${result.pSlfPoints} pSLF points`,
        });
    }
    catch (error) {
        console.error('Mint error:', error);
        await (0, security_1.logSecurityEvent)(req, 'MINT_ERROR', { error: error.message }, true);
        res.status(500).json({ error: error.message || 'Failed to mint points' });
    }
});
router.post('/claim-bonus', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required' });
        }
        const result = await mintService_1.mintService.awardInitialBonus(walletAddress);
        if (result.awarded) {
            await (0, security_1.logSecurityEvent)(req, 'INITIAL_BONUS_CLAIMED', { walletAddress, points: result.points });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Bonus claim error:', error);
        res.status(500).json({ error: error.message || 'Failed to claim bonus' });
    }
});
router.get('/balance/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const balance = await mintService_1.mintService.getPointBalance(walletAddress);
        if (!balance) {
            return res.json({
                pSlfPoints: '0',
                pointsEarnedFromMinting: '0',
                pointsEarnedFromPlatform: '0',
                pointsEarnedFromReferrals: '0',
                pointsEarnedFromTasks: '0',
                initialBonusReceived: false,
            });
        }
        res.json(balance);
    }
    catch (error) {
        console.error('Balance fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch balance' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const settings = await mintService_1.mintService.getMintSettings();
        const userStats = await mintService_1.mintService.getUserStats();
        res.json({
            totalSupply: settings?.totalSupply || '100000000',
            pointHoldersAllocationPercent: settings?.pointHoldersAllocationPercent || '60',
            totalXlmReceived: settings?.totalXlmReceived || '0',
            totalPSlfMinted: settings?.totalPSlfMinted || '0',
            mintingActive: settings?.mintingActive !== false,
            totalUsers: userStats?.totalUsers || 0,
            usersWithInitialBonus: userStats?.usersWithInitialBonus || 0,
            totalPSlfDistributed: userStats?.totalPSlfDistributed || '0',
        });
    }
    catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch stats' });
    }
});
router.get('/referral/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const referralLink = await referralService_1.referralService.getOrCreateReferralLink(walletAddress);
        res.json({
            referralCode: referralLink.referralCode,
            referralUrl: `${process.env.FRONTEND_URL || 'https://stellforge.replit.app'}?ref=${referralLink.referralCode}`,
            totalReferrals: referralLink.totalReferrals,
            successfulReferrals: referralLink.successfulReferrals,
        });
    }
    catch (error) {
        console.error('Referral fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch referral link' });
    }
});
router.post('/referral/claim', async (req, res) => {
    try {
        const { referralCode, walletAddress } = req.body;
        const security = req.security;
        if (!referralCode || !walletAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await referralService_1.referralService.recordReferral(referralCode, walletAddress, security.ip, security.fingerprint);
        await (0, security_1.logSecurityEvent)(req, 'REFERRAL_CLAIMED', { referralCode, walletAddress });
        res.json({
            success: true,
            message: `Referral recorded! ${result.referrerWallet} earned ${result.pointsAwarded} pSLF points`,
            pointsAwarded: result.pointsAwarded,
        });
    }
    catch (error) {
        console.error('Referral claim error:', error);
        await (0, security_1.logSecurityEvent)(req, 'REFERRAL_ERROR', { error: error.message }, true);
        res.status(400).json({ error: error.message || 'Failed to process referral' });
    }
});
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await taskService_1.taskService.getActiveTasks();
        res.json(tasks);
    }
    catch (error) {
        console.error('Tasks fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
    }
});
router.get('/tasks/completed/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const completed = await taskService_1.taskService.getUserCompletedTasks(walletAddress);
        res.json(completed);
    }
    catch (error) {
        console.error('Completed tasks fetch error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch completed tasks' });
    }
});
router.post('/tasks/complete', async (req, res) => {
    try {
        const { walletAddress, taskId, proofData } = req.body;
        if (!walletAddress || !taskId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await taskService_1.taskService.completeTask(walletAddress, taskId, proofData);
        await (0, security_1.logSecurityEvent)(req, 'TASK_COMPLETED', { walletAddress, taskId });
        res.json({
            success: true,
            pointsAwarded: result.pointsAwarded,
            message: `Task completed! Earned ${result.pointsAwarded} pSLF points`,
        });
    }
    catch (error) {
        console.error('Task completion error:', error);
        res.status(400).json({ error: error.message || 'Failed to complete task' });
    }
});
exports.default = router;
