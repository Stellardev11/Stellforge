import express, { Request, Response } from 'express';
import { 
  getActivePools, 
  getPoolDetails, 
  getPoolsForAsset,
  calculateLPShares,
  estimatePoolPrice,
  calculatePoolShare
} from '../services/liquidityService';

const router = express.Router();

router.get('/pools', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const pools = await getActivePools(limit);
    res.json({ success: true, pools });
  } catch (error: any) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch liquidity pools' 
    });
  }
});

router.get('/pools/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await getPoolDetails(id);
    
    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pool not found' 
      });
    }

    res.json({ success: true, pool });
  } catch (error: any) {
    console.error('Error fetching pool details:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch pool details' 
    });
  }
});

router.get('/pools/for-asset/:assetCode/:assetIssuer', async (req: Request, res: Response) => {
  try {
    const { assetCode, assetIssuer } = req.params;
    const pools = await getPoolsForAsset(assetCode, assetIssuer);
    res.json({ success: true, pools });
  } catch (error: any) {
    console.error('Error fetching pools for asset:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch pools for asset' 
    });
  }
});

router.post('/calculate-shares', async (req: Request, res: Response) => {
  try {
    const { poolId, tokenAAmount, tokenBAmount } = req.body;

    if (!poolId || !tokenAAmount || !tokenBAmount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }

    const pool = await getPoolDetails(poolId);
    
    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pool not found' 
      });
    }

    const shares = calculateLPShares(pool, tokenAAmount, tokenBAmount);
    const poolShare = calculatePoolShare(shares, pool.total_shares);
    
    res.json({ 
      success: true, 
      shares,
      poolShare: poolShare.toFixed(4),
      pool 
    });
  } catch (error: any) {
    console.error('Error calculating shares:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to calculate LP shares' 
    });
  }
});

router.get('/pool-price/:poolId', async (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const { fromAsset } = req.query;

    if (!fromAsset) {
      return res.status(400).json({ 
        success: false, 
        error: 'fromAsset parameter is required' 
      });
    }

    const pool = await getPoolDetails(poolId);
    
    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pool not found' 
      });
    }

    const price = estimatePoolPrice(pool, fromAsset as string);
    
    res.json({ 
      success: true, 
      price,
      pool 
    });
  } catch (error: any) {
    console.error('Error estimating pool price:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to estimate pool price' 
    });
  }
});

export default router;
