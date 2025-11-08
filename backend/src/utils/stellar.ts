import * as StellarSdk from '@stellar/stellar-sdk';
import { Asset } from '@stellar/stellar-sdk';

export const getServer = () => {
  const network = process.env.STELLAR_NETWORK || 'mainnet';
  const isTestnet = network === 'testnet';
  const horizonUrl = process.env.STELLAR_HORIZON_URL || 
    (isTestnet 
      ? 'https://horizon-testnet.stellar.org' 
      : 'https://horizon.stellar.org');
  
  return new StellarSdk.Horizon.Server(horizonUrl);
};

export const getNetworkPassphrase = () => {
  const network = process.env.STELLAR_NETWORK || 'mainnet';
  return network === 'testnet'
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC;
};

export const getAsset = (code: string, issuer: string): Asset => {
  if (code === 'XLM' || issuer === 'native') {
    return Asset.native();
  }
  return new Asset(code, issuer);
};

export const validateAsset = (code: string, issuer: string): boolean => {
  try {
    if (!code || code.length === 0 || code.length > 12) {
      return false;
    }

    if (code === 'XLM' && issuer === 'native') {
      return true;
    }

    if (!issuer || issuer.length !== 56) {
      return false;
    }

    const asset = new Asset(code, issuer);
    return true;
  } catch (error) {
    return false;
  }
};

export const formatAmount = (amount: string | number, decimals: number = 7): string => {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(num)) {
      return '0';
    }

    return num.toFixed(decimals).replace(/\.?0+$/, '');
  } catch (error) {
    return '0';
  }
};

export const fundTestnetAccount = async (publicKey: string): Promise<boolean> => {
  if (process.env.STELLAR_NETWORK !== 'testnet') {
    throw new Error('Funding only available on testnet');
  }

  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return response.ok;
  } catch (error) {
    console.error('Friendbot funding error:', error);
    return false;
  }
};

export const createStellarAsset = async (params: {
  assetCode: string;
  issuerPublicKey: string;
  distributorKeypair: StellarSdk.Keypair;
  amount: string;
}) => {
  const { assetCode, issuerPublicKey, distributorKeypair, amount } = params;
  const server = getServer();
  const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);

  const account = await server.loadAccount(distributorKeypair.publicKey());
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(StellarSdk.Operation.changeTrust({
      asset: asset,
      limit: amount
    }))
    .addOperation(StellarSdk.Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: asset,
      amount: amount
    }))
    .setTimeout(30)
    .build();

  transaction.sign(distributorKeypair);
  
  const result = await server.submitTransaction(transaction);
  return result;
};

export { StellarSdk };
