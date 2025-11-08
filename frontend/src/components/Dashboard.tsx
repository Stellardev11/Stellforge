import { Gift, Target, Users, Rocket, ArrowRight, CheckCircle2, TrendingUp, Coins, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

type DashboardProps = {
  setActiveTab: (tab: 'dashboard' | 'launchpad' | 'create-token' | 'trading' | 'launches') => void
}

export default function NewDashboard({ setActiveTab }: DashboardProps) {
  const stats = [
    { label: 'Live Tokens', value: '156', icon: Rocket },
    { label: 'Total Volume', value: '$2.8M', icon: Trophy },
    { label: 'Active Airdrops', value: '42', icon: Target },
    { label: 'Total Holders', value: '18.5K', icon: Users },
  ]

  const lifecycle = [
    {
      step: '1',
      title: 'Create Token',
      description: 'Launch your token with name, symbol, supply, and custom branding.',
      icon: Rocket,
      color: 'from-blue-500 to-blue-600',
    },
    {
      step: '2',
      title: 'Setup Airdrop',
      description: 'Configure distribution percentages and social tasks for community engagement.',
      icon: Gift,
      color: 'from-purple-500 to-purple-600',
    },
    {
      step: '3',
      title: 'Users Participate',
      description: 'Community completes tasks, earns tokens, and becomes eligible for claims.',
      icon: Users,
      color: 'from-green-500 to-green-600',
    },
    {
      step: '4',
      title: 'Launch Curve Trading',
      description: 'Token trades on launch curve with fair price discovery as demand grows.',
      icon: TrendingUp,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      step: '5',
      title: 'DEX Launch',
      description: 'At $100K market cap, token auto-launches on Stellar DEX for full liquidity.',
      icon: CheckCircle2,
      color: 'from-stellar-bright-blue to-lumina-gold',
    },
  ]

  return (
    <div className="bg-deep-space">
      <section 
        className="relative py-20 md:py-32 overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="absolute inset-0 bg-pattern"></div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6 text-sm font-medium text-stellar-bright-blue">
                <Rocket className="w-4 h-4" />
                Fair Token Launch Platform on Stellar
              </div>
              
              <h1 className="text-display-lg md:text-6xl mb-6 text-white">
                Create, Distribute & Trade
                <span className="text-gradient block mt-2">Tokens with Launch Curves</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                Launch tokens with airdrops, launch curve trading, and automatic DEX listing at $100K market cap. All on Stellar blockchain.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('create-token')}
                  className="group px-8 py-4 bg-gradient-to-r from-stellar-bright-blue to-blue-600 hover:from-stellar-bright-blue/90 hover:to-blue-600/90 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-glow flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Launch Token
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveTab('launches')}
                  className="px-8 py-4 glass-card hover:bg-white/10 text-white rounded-lg font-semibold text-lg transition-all border border-white/10"
                >
                  Explore Launches
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-deep-space/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <Icon className="w-8 h-8 text-stellar-bright-blue mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-display-sm md:text-display-md text-white mb-4">
              How <span className="text-gradient">StellForge</span> Works
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Complete token lifecycle from creation to DEX listing in 5 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {lifecycle.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="glass-card rounded-xl p-6 hover:shadow-glow transition-all relative"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} rounded-t-xl`}></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold`}>
                      {item.step}
                    </div>
                    <Icon className="w-6 h-6 text-stellar-bright-blue" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-16 glass-card rounded-2xl p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Coins className="w-12 h-12 text-stellar-bright-blue" />
                <h2 className="text-display-sm text-white">
                  Ready to Launch?
                </h2>
              </div>
              <p className="text-lg text-gray-300 mb-8">
                Create your token in minutes with our easy wizard. Set up airdrops, launch curve trading, and watch your community grow.
              </p>
              <button
                onClick={() => setActiveTab('create-token')}
                className="group px-10 py-5 bg-gradient-to-r from-stellar-bright-blue to-blue-600 hover:from-stellar-bright-blue/90 hover:to-blue-600/90 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-glow inline-flex items-center gap-2"
              >
                <Rocket className="w-6 h-6" />
                Launch Your Token Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
