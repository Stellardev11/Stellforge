import express from 'express';
import { projectService } from '../services/projectService';

const router = express.Router();

router.post('/create', async (req, res, next) => {
  try {
    const {
      creatorWalletAddress,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals,
      description,
      logoUrl,
      airdropPercent,
      liquidityPercent,
      initialLiquidityXLM,
      eventDurationDays,
      vestingEnabled,
      vestingMonths,
    } = req.body;

    if (!creatorWalletAddress || !tokenName || !tokenSymbol || !totalSupply || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (typeof airdropPercent !== 'number' || typeof liquidityPercent !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid allocation settings'
      });
    }

    if (airdropPercent < 0 || liquidityPercent < 0) {
      return res.status(400).json({
        success: false,
        error: 'All percentages must be positive'
      });
    }

    if (airdropPercent < 10) {
      return res.status(400).json({
        success: false,
        error: 'Airdrop allocation must be at least 10%'
      });
    }

    if (liquidityPercent < 10) {
      return res.status(400).json({
        success: false,
        error: 'Liquidity allocation must be at least 10%'
      });
    }

    const total = airdropPercent + liquidityPercent;
    if (total > 100) {
      return res.status(400).json({
        success: false,
        error: `Airdrop + Liquidity cannot exceed 100% (currently ${total}%)`
      });
    }

    if (!initialLiquidityXLM || initialLiquidityXLM < 2000) {
      return res.status(400).json({
        success: false,
        error: 'Minimum liquidity requirement is 2,000 XLM'
      });
    }

    if (!eventDurationDays || eventDurationDays < 3 || eventDurationDays > 7) {
      return res.status(400).json({
        success: false,
        error: 'Event duration must be between 3 and 7 days'
      });
    }

    const project = await projectService.createProject({
      creatorWalletAddress,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals: decimals || 7,
      description,
      logoUrl,
      airdropPercent,
      liquidityPercent,
      initialLiquidityXLM,
      eventDurationDays,
      vestingEnabled: vestingEnabled || false,
      vestingMonths,
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', async (req, res, next) => {
  try {
    const projects = await projectService.getActiveProjects();
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.getProject(projectId);
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:projectId/participate', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { participantWalletAddress, xlmAmount, transactionHash } = req.body;

    if (!participantWalletAddress || !xlmAmount || !transactionHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await projectService.participate({
      projectId,
      participantWalletAddress,
      xlmAmount,
      transactionHash,
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:projectId/participations', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const participations = await projectService.getProjectParticipations(projectId);
    res.json({
      success: true,
      data: participations
    });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:walletAddress/participations', async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const participations = await projectService.getUserParticipations(walletAddress);
    res.json({
      success: true,
      data: participations
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:projectId/finalize', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { distributorPublicKey } = req.body;

    if (!distributorPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'distributor public key is required'
      });
    }

    const result = await projectService.finalizeProject(projectId, distributorPublicKey);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
