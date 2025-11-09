import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || 'CDUMMY_CONTRACT_ID_WILL_BE_SET_AFTER_DEPLOYMENT';
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';

const horizonServer = new StellarSdk.Horizon.Server(
  NETWORK === 'mainnet' 
    ? 'https://horizon.stellar.org'
    : `https://horizon-${NETWORK}.stellar.org`
);

const sorobanServer = new StellarSdk.SorobanRpc.Server(
  NETWORK === 'mainnet'
    ? 'https://soroban-rpc.mainnet.stellar.org'
    : `https://soroban-rpc.${NETWORK}.stellar.org`
);

export interface Campaign {
  creator: string;
  token_id: string;
  total_supply: bigint;
  airdrop_amount: bigint;
  liquidity_amount: bigint;
  claimed: bigint;
  is_active: boolean;
}

export interface UserPoints {
  user: string;
  points: bigint;
  referrals: bigint;
}

export class ContractService {
  private contractId: string;

  constructor(contractId: string = CONTRACT_ID) {
    this.contractId = contractId;
  }

  async createCampaign(
    sourceAddress: string,
    tokenId: string,
    totalSupply: bigint,
    airdropPercent: bigint,
    liquidityPercent: bigint
  ): Promise<string> {
    const account = await horizonServer.loadAccount(sourceAddress);
    
    const contract = new StellarSdk.Contract(this.contractId);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK === 'mainnet' 
        ? StellarSdk.Networks.PUBLIC 
        : StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'create_campaign',
          StellarSdk.Address.fromString(sourceAddress).toScVal(),
          StellarSdk.Address.fromString(tokenId).toScVal(),
          StellarSdk.nativeToScVal(totalSupply, { type: 'i128' }),
          StellarSdk.nativeToScVal(airdropPercent, { type: 'i128' }),
          StellarSdk.nativeToScVal(liquidityPercent, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(transaction);
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTx.toXDR();
  }

  async claimAirdrop(
    campaignId: bigint,
    userAddress: string,
    amount: bigint
  ): Promise<string> {
    const account = await horizonServer.loadAccount(userAddress);
    
    const contract = new StellarSdk.Contract(this.contractId);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK === 'mainnet' 
        ? StellarSdk.Networks.PUBLIC 
        : StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'claim_airdrop',
          StellarSdk.nativeToScVal(campaignId, { type: 'u64' }),
          StellarSdk.Address.fromString(userAddress).toScVal(),
          StellarSdk.nativeToScVal(amount, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(transaction);
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTx.toXDR();
  }

  async addPoints(
    userAddress: string,
    points: bigint,
    referrals: bigint
  ): Promise<string> {
    const account = await horizonServer.loadAccount(userAddress);
    
    const contract = new StellarSdk.Contract(this.contractId);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK === 'mainnet' 
        ? StellarSdk.Networks.PUBLIC 
        : StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'add_points',
          StellarSdk.Address.fromString(userAddress).toScVal(),
          StellarSdk.nativeToScVal(points, { type: 'i128' }),
          StellarSdk.nativeToScVal(referrals, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(transaction);
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulated
    ).build();
    
    return preparedTx.toXDR();
  }

  async getUserPoints(userAddress: string): Promise<UserPoints | null> {
    try {
      return {
        user: userAddress,
        points: BigInt(0),
        referrals: BigInt(0),
      };
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  async getCampaign(_campaignId: bigint): Promise<Campaign | null> {
    try {
      return null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

}

export const contractService = new ContractService();
