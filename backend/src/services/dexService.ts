import { Asset, Horizon } from '@stellar/stellar-sdk';
import { getServer, getAsset } from '../utils/stellar';

interface SwapQuote {
  sourceAmount: string;
  destinationAmount: string;
  path: Asset[];
  price: string;
  slippage: number;
}

interface OrderbookEntry {
  price: string;
  amount: string;
}

interface Orderbook {
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  base: { code: string; issuer: string };
  counter: { code: string; issuer: string };
}

export const getSwapQuote = async (
  fromAssetCode: string,
  fromAssetIssuer: string,
  toAssetCode: string,
  toAssetIssuer: string,
  amount: string,
  mode: 'send' | 'receive' = 'send'
): Promise<SwapQuote> => {
  try {
    const server = getServer();
    const sourceAsset = getAsset(fromAssetCode, fromAssetIssuer);
    const destAsset = getAsset(toAssetCode, toAssetIssuer);

    let pathsResponse;

    if (mode === 'send') {
      pathsResponse = await server
        .strictSendPaths(sourceAsset, amount, [destAsset])
        .call();
    } else {
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
    
    const path = bestPath.path.map((p: any) => {
      if (p.asset_type === 'native') {
        return Asset.native();
      }
      return new Asset(p.asset_code, p.asset_issuer);
    });

    const slippage = calculateSlippage(pathsResponse.records);

    return {
      sourceAmount,
      destinationAmount: destAmount,
      path,
      price,
      slippage
    };
  } catch (error) {
    console.error('Error getting swap quote:', error);
    throw new Error('Failed to get swap quote from Stellar network');
  }
};

export const findBestPath = async (
  fromAssetCode: string,
  fromAssetIssuer: string,
  toAssetCode: string,
  toAssetIssuer: string,
  amount: string
): Promise<Asset[]> => {
  try {
    const server = getServer();
    const sourceAsset = getAsset(fromAssetCode, fromAssetIssuer);
    const destAsset = getAsset(toAssetCode, toAssetIssuer);

    const pathsResponse = await server
      .strictSendPaths(sourceAsset, amount, [destAsset])
      .call();

    if (!pathsResponse.records || pathsResponse.records.length === 0) {
      return [];
    }

    const bestPath = pathsResponse.records[0];
    
    const path = bestPath.path.map((p: any) => {
      if (p.asset_type === 'native') {
        return Asset.native();
      }
      return new Asset(p.asset_code, p.asset_issuer);
    });

    return path;
  } catch (error) {
    console.error('Error finding best path:', error);
    throw new Error('Failed to find trading path on Stellar network');
  }
};

export const getOrderbook = async (
  sellingAssetCode: string,
  sellingAssetIssuer: string,
  buyingAssetCode: string,
  buyingAssetIssuer: string,
  limit: number = 20
): Promise<Orderbook> => {
  try {
    const server = getServer();
    const sellingAsset = getAsset(sellingAssetCode, sellingAssetIssuer);
    const buyingAsset = getAsset(buyingAssetCode, buyingAssetIssuer);

    const orderbookResponse = await server
      .orderbook(sellingAsset, buyingAsset)
      .limit(limit)
      .call();

    const bids: OrderbookEntry[] = orderbookResponse.bids.map((bid: any) => ({
      price: bid.price,
      amount: bid.amount
    }));

    const asks: OrderbookEntry[] = orderbookResponse.asks.map((ask: any) => ({
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
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    throw new Error('Failed to fetch orderbook from Stellar network');
  }
};

export const calculateSlippage = (paths: any[]): number => {
  if (!paths || paths.length < 2) {
    return 0;
  }

  try {
    const bestRate = parseFloat(paths[0].destination_amount) / parseFloat(paths[0].source_amount);
    const worstRate = parseFloat(paths[paths.length - 1].destination_amount) / parseFloat(paths[paths.length - 1].source_amount);
    
    const slippage = ((bestRate - worstRate) / bestRate) * 100;
    
    return Math.max(0, Math.min(slippage, 100));
  } catch (error) {
    console.error('Error calculating slippage:', error);
    return 0;
  }
};

export const getTradeHistory = async (
  baseAssetCode: string,
  baseAssetIssuer: string,
  counterAssetCode: string,
  counterAssetIssuer: string,
  limit: number = 50
): Promise<any[]> => {
  try {
    const server = getServer();
    const baseAsset = getAsset(baseAssetCode, baseAssetIssuer);
    const counterAsset = getAsset(counterAssetCode, counterAssetIssuer);

    const tradesResponse = await server
      .trades()
      .forAssetPair(baseAsset, counterAsset)
      .order('desc')
      .limit(limit)
      .call();

    return tradesResponse.records.map((trade: any) => ({
      id: trade.id,
      ledger: trade.ledger_close_time,
      price: trade.price,
      baseAmount: trade.base_amount,
      counterAmount: trade.counter_amount,
      type: trade.base_is_seller ? 'sell' : 'buy'
    }));
  } catch (error) {
    console.error('Error fetching trade history:', error);
    throw new Error('Failed to fetch trade history from Stellar network');
  }
};
