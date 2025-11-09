import express from 'express';
import { mintService } from '../services/mintService';
import { referralService } from '../services/referralService';
import { taskService } from '../services/taskService';
import { logSecurityEvent } from '../middleware/security';

const router = express.Router();

router.post('/mint', async (req, res) => {
  try {
    const { walletAddress, xlmAmount, transactionHash } = req.body;

    if (!walletAddress || !xlmAmount || !transactionHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await mintService.mintPoints(walletAddress, parseFloat(xlmAmount), transactionHash);
    
    await logSecurityEvent(req, 'MINT_POINTS', { walletAddress, xlmAmount, transactionHash });

    res.json({
      success: true,
      starPoints: result.starPoints,
      message: `Successfully minted ${result.starPoints} STAR points!`,
    });
  } catch (error: any) {
    console.error('Mint error:', error);
    await logSecurityEvent(req, 'MINT_ERROR', { error: error.message }, true);
    res.status(500).json({ error: error.message || 'Failed to mint points' });
  }
});

router.post('/claim-bonus', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const result = await mintService.awardInitialBonus(walletAddress);

    if (result.awarded) {
      await logSecurityEvent(req, 'INITIAL_BONUS_CLAIMED', { walletAddress, points: result.points });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Bonus claim error:', error);
    res.status(500).json({ error: error.message || 'Failed to claim bonus' });
  }
});

router.get('/balance/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const balance = await mintService.getPointBalance(walletAddress);

    if (!balance) {
      return res.json({
        starPoints: '0',
        pointsEarnedFromMinting: '0',
        pointsEarnedFromPlatform: '0',
        pointsEarnedFromReferrals: '0',
        pointsEarnedFromTasks: '0',
        initialBonusReceived: false,
      });
    }

    res.json(balance);
  } catch (error: any) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch balance' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const settings = await mintService.getMintSettings();
    const userStats = await mintService.getUserStats();

    res.json({
      totalSupply: settings?.totalSupply || '100000000',
      pointHoldersAllocationPercent: settings?.pointHoldersAllocationPercent || '60',
      totalXlmReceived: settings?.totalXlmReceived || '0',
      totalStarMinted: settings?.totalStarMinted || '0',
      mintingActive: settings?.mintingActive !== false,
      totalUsers: userStats?.totalUsers || 0,
      usersWithInitialBonus: userStats?.usersWithInitialBonus || 0,
      totalStarDistributed: userStats?.totalStarDistributed || '0',
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
});

router.get('/referral/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const referralLink = await referralService.getOrCreateReferralLink(walletAddress);

    res.json({
      referralCode: referralLink.referralCode,
      referralUrl: `${process.env.FRONTEND_URL || 'https://stellforge.replit.app'}?ref=${referralLink.referralCode}`,
      totalReferrals: referralLink.totalReferrals,
      successfulReferrals: referralLink.successfulReferrals,
    });
  } catch (error: any) {
    console.error('Referral fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch referral link' });
  }
});

router.post('/referral/claim', async (req, res) => {
  try {
    const { referralCode, walletAddress } = req.body;
    const security = (req as any).security;

    if (!referralCode || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await referralService.recordReferral(
      referralCode,
      walletAddress,
      security.ip,
      security.fingerprint
    );

    await logSecurityEvent(req, 'REFERRAL_CLAIMED', { referralCode, walletAddress });

    res.json({
      success: true,
      message: `Referral recorded! ${result.referrerWallet} earned ${result.pointsAwarded} STAR points`,
      pointsAwarded: result.pointsAwarded,
    });
  } catch (error: any) {
    console.error('Referral claim error:', error);
    await logSecurityEvent(req, 'REFERRAL_ERROR', { error: error.message }, true);
    res.status(400).json({ error: error.message || 'Failed to process referral' });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await taskService.getActiveTasks();
    res.json(tasks);
  } catch (error: any) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

router.get('/tasks/completed/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const completed = await taskService.getUserCompletedTasks(walletAddress);
    res.json(completed);
  } catch (error: any) {
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

    const result = await taskService.completeTask(walletAddress, taskId, proofData);

    await logSecurityEvent(req, 'TASK_COMPLETED', { walletAddress, taskId });

    res.json({
      success: true,
      pointsAwarded: result.pointsAwarded,
      message: `Task completed! Earned ${result.pointsAwarded} STAR points`,
    });
  } catch (error: any) {
    console.error('Task completion error:', error);
    res.status(400).json({ error: error.message || 'Failed to complete task' });
  }
});

export default router;
