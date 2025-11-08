import { Asset, LiquidityPoolAsset } from '@stellar/stellar-sdk';
import { getServer, getAsset } from '../utils/stellar';

interface PoolInfo {
  id: string;
  fee_bp: number;
  type: string;
  total_shares: string;
  total_trustlines: string;
  reserves: Array<{
    asset: string;
    amount: string;
  }>;
}

interface PoolDetails extends PoolInfo {
  paging_token: string;
  asset_a: {
    code: string;
    issuer: string;
  };
  asset_b: {
    code: string;
    issuer: string;
  };
}

export const getActivePools = async (limit: number = 50): Promise<PoolInfo[]> => {
  try {
    const server = getServer();
    const poolsResponse = await server
      .liquidityPools()
      .limit(limit)
      .order('desc')
      .call();

    const pools: PoolInfo[] = poolsResponse.records.map((pool: any) => ({
      id: pool.id,
      fee_bp: pool.fee_bp,
      type: pool.type,
      total_shares: pool.total_shares,
      total_trustlines: pool.total_trustlines,
      reserves: pool.reserves.map((reserve: any) => ({
        asset: reserve.asset === 'native' ? 'native' : reserve.asset,
        amount: reserve.amount
      }))
    }));

    return pools;
  } catch (error) {
    console.error('Error fetching active pools:', error);
    throw new Error('Failed to fetch liquidity pools from Stellar network');
  }
};

export const getPoolDetails = async (poolId: string): Promise<PoolDetails | null> => {
  try {
    const server = getServer();
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
      reserves: pool.reserves.map((reserve: any) => ({
        asset: reserve.asset === 'native' ? 'XLM' : reserve.asset,
        amount: reserve.amount
      })),
      asset_a: assetA,
      asset_b: assetB
    };
  } catch (error) {
    console.error('Error fetching pool details:', error);
    throw new Error('Failed to fetch pool details from Stellar network');
  }
};

export const calculateLPShares = (
  pool: PoolDetails,
  tokenAAmount: string,
  tokenBAmount: string
): string => {
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
  } catch (error) {
    console.error('Error calculating LP shares:', error);
    throw new Error('Failed to calculate LP shares');
  }
};

export const getPoolsForAsset = async (
  assetCode: string,
  assetIssuer: string
): Promise<PoolInfo[]> => {
  try {
    const server = getServer();
    const asset = getAsset(assetCode, assetIssuer);

    const poolsResponse = await server
      .liquidityPools()
      .forAssets(asset)
      .limit(100)
      .call();

    const pools: PoolInfo[] = poolsResponse.records.map((pool: any) => ({
      id: pool.id,
      fee_bp: pool.fee_bp,
      type: pool.type,
      total_shares: pool.total_shares,
      total_trustlines: pool.total_trustlines,
      reserves: pool.reserves.map((reserve: any) => ({
        asset: reserve.asset === 'native' ? 'XLM' : reserve.asset,
        amount: reserve.amount
      }))
    }));

    return pools;
  } catch (error) {
    console.error('Error fetching pools for asset:', error);
    throw new Error('Failed to fetch pools for asset from Stellar network');
  }
};

export const estimatePoolPrice = (pool: PoolDetails, fromAsset: string): string => {
  try {
    const reserve0Asset = pool.reserves[0].asset;
    const reserve0Amount = parseFloat(pool.reserves[0].amount);
    const reserve1Amount = parseFloat(pool.reserves[1].amount);

    if (reserve0Asset.includes(fromAsset) || reserve0Asset === fromAsset) {
      return (reserve1Amount / reserve0Amount).toFixed(7);
    } else {
      return (reserve0Amount / reserve1Amount).toFixed(7);
    }
  } catch (error) {
    console.error('Error estimating pool price:', error);
    return '0';
  }
};

export const calculatePoolShare = (
  userShares: string,
  totalShares: string
): number => {
  try {
    const shares = parseFloat(userShares);
    const total = parseFloat(totalShares);
    
    if (total === 0) return 0;
    
    return (shares / total) * 100;
  } catch (error) {
    console.error('Error calculating pool share:', error);
    return 0;
  }
};
