import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  ISupportedWallet,
  allowAllModules,
  FREIGHTER_ID 
} from '@creit.tech/stellar-wallets-kit'
import * as StellarSdk from '@stellar/stellar-sdk'
import { AccountBalance } from '../types/stellar'
import { api } from '../api/client'

const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org')

export interface WalletContextType {
  kit: StellarWalletsKit | null
  connected: boolean
  address: string
  network: WalletNetwork
  balances: AccountBalance[]
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (network: WalletNetwork) => void
  getAccountBalances: () => Promise<void>
  signAndSubmitTransaction: (xdr: string) => Promise<any>
}

const WalletContext = createContext<WalletContextType | null>(null)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null)
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balances, setBalances] = useState<AccountBalance[]>([])
  const [network, setNetwork] = useState<WalletNetwork>(WalletNetwork.PUBLIC)

  useEffect(() => {
    const walletKit = new StellarWalletsKit({
      network: network,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    })
    setKit(walletKit)
  }, [network])

  const getAccountBalances = async () => {
    if (!address) return

    try {
      const account = await server.loadAccount(address)
      setBalances(account.balances as AccountBalance[])
    } catch (error) {
      console.error('Failed to load account balances:', error)
      setBalances([])
    }
  }

  const connectWallet = async () => {
    if (!kit) return

    try {
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id)
          const { address: walletAddress } = await kit.getAddress()
          setAddress(walletAddress)
          setConnected(true)
          
          try {
            const account = await server.loadAccount(walletAddress)
            setBalances(account.balances as AccountBalance[])
          } catch (error) {
            console.error('Failed to load balances:', error)
          }
        },
      })
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  const disconnectWallet = () => {
    setConnected(false)
    setAddress('')
    setBalances([])
  }

  const switchNetwork = (newNetwork: WalletNetwork) => {
    disconnectWallet()
    setNetwork(newNetwork)
  }

  const signAndSubmitTransaction = async (xdr: string) => {
    if (!kit) {
      throw new Error('Wallet not initialized')
    }

    try {
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        address,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      })

      const result = await api.submitTransaction(signedTxXdr)
      
      await getAccountBalances()
      
      return result
    } catch (error) {
      console.error('Transaction signing/submission failed:', error)
      throw error
    }
  }

  useEffect(() => {
    if (connected && address) {
      getAccountBalances()
      const interval = setInterval(getAccountBalances, 30000)
      return () => clearInterval(interval)
    }
  }, [connected, address])

  return (
    <WalletContext.Provider
      value={{
        kit,
        connected,
        address,
        network,
        balances,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        getAccountBalances,
        signAndSubmitTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
