import { useState } from 'react'
import { Menu, X, ArrowDownUp, Droplets, Wallet, Coins, BookOpen } from 'lucide-react'
import { useWallet } from '../context/WalletContext'

type TabType = 'swap' | 'liquidity' | 'projects' | 'points' | 'docs'

interface TopNavProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const ProjectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
  </svg>
)

export default function TopNav({ activeTab, setActiveTab }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { connected, connectWallet, address } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`
  }

  const navItems: { id: TabType; icon: typeof ArrowDownUp | (() => JSX.Element); label: string }[] = [
    { id: 'swap', icon: ArrowDownUp, label: 'Swap' },
    { id: 'liquidity', icon: Droplets, label: 'Liquidity' },
    { id: 'projects', icon: ProjectIcon, label: 'Projects' },
    { id: 'points', icon: Coins, label: 'Points & Mint' },
    { id: 'docs', icon: BookOpen, label: 'Documentation' },
  ]

  return (
    <>
      <div className="sticky top-0 z-50 bg-[#0B0E11]/98 backdrop-blur-md border-b border-[#2B3139]">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Professional Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/stellforge-icon.png" 
              alt="StellForge" 
              className="w-8 h-8 rounded-lg shadow-lg" 
            />
            <h1 className="text-xl font-bold text-white">
              StellForge
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Wallet Button */}
            {connected ? (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] rounded text-white text-sm transition-all"
              >
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">{formatAddress(address)}</span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] hover:border-[#F7931A]/50 rounded text-white text-sm transition-all"
              >
                <Wallet size={14} />
                <span className="text-xs font-medium">Connect</span>
              </button>
            )}
            
            {/* Menu Dots */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1E2329] rounded transition-all"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-[57px] right-0 w-64 bg-[#1E2329] border-l border-[#2B3139] z-50 shadow-2xl">
            <div className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-[#F7931A]/10 text-[#F7931A]' 
                        : 'text-gray-400 hover:bg-[#2B3139] hover:text-white'
                    }`}
                  >
                    {typeof Icon === 'function' && Icon.name === 'ProjectIcon' ? (
                      <Icon />
                    ) : (
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
