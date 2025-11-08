import { StellarSdk, getServer, getNetworkPassphrase, fundTestnetAccount } from '../utils/stellar';

interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  mintable: boolean;
  burnable: boolean;
  distributorPublicKey: string;
}

export const createToken = async (params: CreateTokenParams) => {
  const { symbol, totalSupply, distributorPublicKey } = params;
  
  const issuerKeypair = StellarSdk.Keypair.random();
  
  if (process.env.STELLAR_NETWORK === 'testnet') {
    await fundTestnetAccount(issuerKeypair.publicKey());
    await fundTestnetAccount(distributorPublicKey);
  }

  const server = getServer();
  const asset = new StellarSdk.Asset(symbol, issuerKeypair.publicKey());
  
  const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
  const distributorAccount = await server.loadAccount(distributorPublicKey);

  const trustTransaction = new StellarSdk.TransactionBuilder(distributorAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(StellarSdk.Operation.changeTrust({
      asset: asset,
      limit: totalSupply || '922337203685.4775807'
    }))
    .setTimeout(30)
    .build();

  const paymentTransaction = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: distributorPublicKey,
      asset: asset,
      amount: totalSupply
    }))
    .setTimeout(30)
    .build();

  paymentTransaction.sign(issuerKeypair);

  const paymentResult = await server.submitTransaction(paymentTransaction);

  return {
    assetCode: symbol,
    issuerPublicKey: issuerKeypair.publicKey(),
    issuerSecretKey: issuerKeypair.secret(),
    transactionHash: paymentResult.hash,
    trustlineTransaction: trustTransaction.toEnvelope().toXDR('base64'),
    ...params
  };
};

export const getTokenInfo = async (assetCode: string, issuer: string) => {
  const server = getServer();
  const asset = new StellarSdk.Asset(assetCode, issuer);
  
  try {
    const assetInfo = await server.assets()
      .forCode(assetCode)
      .forIssuer(issuer)
      .call();
    
    return {
      assetCode,
      issuer,
      records: assetInfo.records
    };
  } catch (error) {
    throw new Error(`Token not found: ${assetCode}`);
  }
};

export const mintTokens = async (params: {
  assetCode: string;
  issuerSecret: string;
  destination: string;
  amount: string;
}) => {
  const { assetCode, issuerSecret, destination, amount } = params;
  const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecret);
  const server = getServer();
  
  const asset = new StellarSdk.Asset(assetCode, issuerKeypair.publicKey());
  const account = await server.loadAccount(issuerKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(StellarSdk.Operation.payment({
      destination,
      asset,
      amount
    }))
    .setTimeout(30)
    .build();

  transaction.sign(issuerKeypair);
  const result = await server.submitTransaction(transaction);

  return {
    transactionHash: result.hash,
    amount,
    destination
  };
};

export const burnTokens = async (params: {
  assetCode: string;
  issuerPublicKey: string;
  fromSecret: string;
  amount: string;
}) => {
  const { assetCode, issuerPublicKey, fromSecret, amount } = params;
  const fromKeypair = StellarSdk.Keypair.fromSecret(fromSecret);
  const server = getServer();
  
  const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
  const account = await server.loadAccount(fromKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: issuerPublicKey,
      asset,
      amount
    }))
    .setTimeout(30)
    .build();

  transaction.sign(fromKeypair);
  const result = await server.submitTransaction(transaction);

  return {
    transactionHash: result.hash,
    amount
  };
};

export const transferTokens = async (params: {
  assetCode: string;
  issuerPublicKey: string;
  fromSecret: string;
  destination: string;
  amount: string;
}) => {
  const { assetCode, issuerPublicKey, fromSecret, destination, amount } = params;
  const fromKeypair = StellarSdk.Keypair.fromSecret(fromSecret);
  const server = getServer();
  
  const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
  const account = await server.loadAccount(fromKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(StellarSdk.Operation.payment({
      destination,
      asset,
      amount
    }))
    .setTimeout(30)
    .build();

  transaction.sign(fromKeypair);
  const result = await server.submitTransaction(transaction);

  return {
    transactionHash: result.hash,
    amount,
    destination
  };
};
