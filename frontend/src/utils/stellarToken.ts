import * as StellarSdk from '@stellar/stellar-sdk'

const TESTNET_SERVER = 'https://horizon-testnet.stellar.org'
const MAINNET_SERVER = 'https://horizon.stellar.org'

export interface TokenParams {
  name: string
  symbol: string
  decimals: string
  totalSupply: string
  mintable: boolean
  burnable: boolean
  userAddress: string
  isTestnet: boolean
}

export interface TokenCreationResult {
  success: boolean
  message: string
  assetCode?: string
  issuerPublicKey?: string
  issuerSecretKey?: string
  transactionHash?: string
  error?: string
  trustlineXDR?: string
}

export async function createStellarToken(params: TokenParams): Promise<TokenCreationResult> {
  try {
    const {
      symbol,
      totalSupply,
      userAddress,
      isTestnet,
    } = params

    const serverUrl = isTestnet ? TESTNET_SERVER : MAINNET_SERVER
    const networkPassphrase = isTestnet
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC
    const server = new StellarSdk.Horizon.Server(serverUrl)

    const issuerKeypair = StellarSdk.Keypair.random()
    console.log('Generated issuer keypair:', issuerKeypair.publicKey())

    if (isTestnet) {
      console.log('Funding issuer account on testnet...')
      try {
        const fundResponse = await fetch(
          `https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`
        )
        
        if (!fundResponse.ok) {
          throw new Error('Failed to fund issuer account')
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error('Friendbot funding error:', error)
        throw new Error('Failed to fund issuer account. Please try again.')
      }
    } else {
      return {
        success: false,
        message: 'Mainnet token creation requires funding the issuer account with real XLM. Please use testnet for testing.',
        error: 'Mainnet requires manual funding',
      }
    }

    const customAsset = new StellarSdk.Asset(symbol.toUpperCase(), issuerKeypair.publicKey())
    console.log('Created asset:', customAsset.getCode())

    console.log('Loading user account...')
    let userAccount
    try {
      userAccount = await server.loadAccount(userAddress)
    } catch (error) {
      throw new Error(
        'Could not load your wallet account. Make sure your wallet is funded with XLM.'
      )
    }

    console.log('Building trustline transaction...')
    const trustTransaction = new StellarSdk.TransactionBuilder(userAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: customAsset,
          limit: totalSupply,
        })
      )
      .setTimeout(180)
      .build()

    const trustlineXDR = trustTransaction.toXDR()

    return {
      success: false,
      message: 'NEEDS_TRUSTLINE_SIGNATURE',
      assetCode: customAsset.getCode(),
      issuerPublicKey: issuerKeypair.publicKey(),
      issuerSecretKey: issuerKeypair.secret(),
      trustlineXDR,
    }
  } catch (error) {
    console.error('Token creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: String(error),
    }
  }
}

export async function completeTokenIssuance(
  assetCode: string,
  issuerSecretKey: string,
  userAddress: string,
  amount: string,
  isTestnet: boolean
): Promise<TokenCreationResult> {
  try {
    const serverUrl = isTestnet ? TESTNET_SERVER : MAINNET_SERVER
    const networkPassphrase = isTestnet
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC
    const server = new StellarSdk.Horizon.Server(serverUrl)

    const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecretKey)
    const customAsset = new StellarSdk.Asset(assetCode, issuerKeypair.publicKey())

    console.log('Loading issuer account...')
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey())

    console.log('Building payment transaction to issue tokens...')
    const paymentTransaction = new StellarSdk.TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: userAddress,
          asset: customAsset,
          amount: amount,
        })
      )
      .setTimeout(180)
      .build()

    paymentTransaction.sign(issuerKeypair)

    console.log('Submitting payment transaction...')
    const result = await server.submitTransaction(paymentTransaction)

    console.log('Token issuance successful!', result.hash)
    return {
      success: true,
      message: `Successfully created ${amount} ${assetCode} tokens!`,
      assetCode,
      issuerPublicKey: issuerKeypair.publicKey(),
      transactionHash: result.hash,
    }
  } catch (error) {
    console.error('Token issuance error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to issue tokens',
      error: String(error),
    }
  }
}
