import { Home, TrendingUp, PlusCircle, Gift, Wallet } from 'lucide-react'

type TabType = 'home' | 'markets' | 'create' | 'airdrops' | 'wallet'

interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: TabType) => void
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems: { id: TabType; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'markets', icon: TrendingUp, label: 'Markets' },
    { id: 'create', icon: PlusCircle, label: 'Create' },
    { id: 'airdrops', icon: Gift, label: 'Airdrops' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pro-dark-lighter/95 border-t border-eth-grey-dark/30 px-2 py-2.5 z-50 backdrop-blur-xl shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-#FCD535 bg-#FCD535/10 scale-105' 
                  : 'text-eth-grey hover:text-white active:scale-95'
              }`}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={`mb-0.5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,196,255,0.5)]' : ''}`}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
