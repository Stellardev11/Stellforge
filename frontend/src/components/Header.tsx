import { WalletNetwork } from '@creit.tech/stellar-wallets-kit'
import { Wallet } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { useState } from 'react'

type TabType = 'dashboard' | 'launchpad' | 'create-token' | 'trading' | 'launches'

interface HeaderProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { connected, address, network, connectWallet, disconnectWallet, switchNetwork } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <header className="bg-deep-space/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 group perspective-container"
            >
              <div className="logo-3d logo-glow relative">
                <div className="absolute inset-0 bg-starglow-gradient opacity-20 blur-xl rounded-full"></div>
                <img 
                  src="/stellforge-icon.png" 
                  alt="StellForge" 
                  className="w-10 h-10 relative z-10 drop-shadow-glow transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-bold text-white lowercase tracking-tight group-hover:text-gradient transition-all">
                stellforge
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'dashboard'
                    ? 'text-stellar-bright-blue bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('launches')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'launches'
                    ? 'text-stellar-bright-blue bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Launches
              </button>
              <button
                onClick={() => setActiveTab('launchpad')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                  activeTab === 'launchpad'
                    ? 'text-stellar-bright-blue bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Airdrops
              </button>
              <button
                onClick={() => setActiveTab('create-token')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-1 ${
                  activeTab === 'create-token'
                    ? 'text-lumina-gold bg-lumina-gold/10 border border-lumina-gold/30'
                    : 'text-gray-300 hover:text-lumina-gold hover:bg-lumina-gold/5 border border-transparent'
                }`}
              >
                Launch Token
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {connected && (
              <select
                value={network}
                onChange={(e) => switchNetwork(e.target.value as WalletNetwork)}
                className="hidden md:block glass-card text-white px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stellar-bright-blue"
              >
                <option value={WalletNetwork.TESTNET} className="bg-oxide-blue">Testnet</option>
                <option value={WalletNetwork.PUBLIC} className="bg-oxide-blue">Mainnet</option>
              </select>
            )}
            
            {!connected ? (
              <button
                onClick={connectWallet}
                className="hidden md:flex items-center gap-2 bg-starglow-gradient hover:shadow-glow text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={disconnectWallet}
                className="hidden md:flex items-center gap-2 glass-card text-gray-200 hover:bg-white/15 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {formatAddress(address)}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white/10 text-stellar-bright-blue'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('launchpad'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'launchpad'
                  ? 'bg-white/10 text-stellar-bright-blue'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Airdrops
            </button>
            <button
              onClick={() => { setActiveTab('launches'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'launches'
                  ? 'bg-white/10 text-stellar-bright-blue'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Launches
            </button>
            <button
              onClick={() => { setActiveTab('create-token'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'create-token'
                  ? 'bg-lumina-gold bg-lumina-gold/10 border border-lumina-gold/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Launch Token
            </button>

            {!connected ? (
              <button
                onClick={() => { connectWallet(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-starglow-gradient text-white px-5 py-3 rounded-lg text-sm font-semibold mt-3"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            ) : (
              <>
                <select
                  value={network}
                  onChange={(e) => switchNetwork(e.target.value as WalletNetwork)}
                  className="w-full glass-card text-white px-4 py-2.5 rounded-lg text-sm font-medium mt-3"
                >
                  <option value={WalletNetwork.TESTNET} className="bg-oxide-blue">Testnet</option>
                  <option value={WalletNetwork.PUBLIC} className="bg-oxide-blue">Mainnet</option>
                </select>
                <button
                  onClick={() => { disconnectWallet(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 glass-card text-gray-200 px-4 py-3 rounded-lg text-sm font-medium"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  {formatAddress(address)}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
