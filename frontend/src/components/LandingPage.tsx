import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Rocket, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Lock, 
  Gift,
  Target,
  FileCheck
} from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'

interface LandingPageProps {
  onEnter: () => void
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const whyScrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

  const features = [
    {
      icon: Rocket,
      title: 'Fair Launch',
      image: '/svgs/fair-launch.svg',
      description: 'Create tokens with fair airdrop mechanics and referral rewards',
      color: '#F7931A'
    },
    {
      icon: TrendingUp,
      title: 'Launch Curve',
      image: '/svgs/launch-curve.svg',
      description: 'Fair price discovery through automated launch curves',
      color: '#FCD535'
    },
    {
      icon: Shield,
      title: 'Vault Security',
      image: '/svgs/vault-security.svg',
      description: 'Tokens secured in battle-tested smart contract vaults',
      color: '#F7931A'
    },
    {
      icon: Zap,
      title: 'Auto DEX',
      image: '/svgs/auto-dex.svg',
      description: 'Automatic DEX listing at $100K market cap',
      color: '#FCD535'
    }
  ]

  const whyFeatures = [
    { 
      icon: Gift, 
      title: 'Fair Airdrop Distribution', 
      description: 'Transparent token distribution through smart contracts' 
    },
    { 
      icon: Target, 
      title: 'Task-Based Rewards', 
      description: 'On-chain and social tasks with automated verification' 
    },
    { 
      icon: Users, 
      title: 'Referral System', 
      description: 'Built-in referral bonuses to grow your community' 
    },
    { 
      icon: Zap, 
      title: 'Automated DEX Listing', 
      description: 'Seamless transition to Stellar DEX at $100K MC' 
    },
    { 
      icon: FileCheck, 
      title: 'On-Chain Verification', 
      description: 'All transactions verified through Soroban smart contracts' 
    },
    { 
      icon: Lock, 
      title: 'Smart Contract Escrow', 
      description: 'Funds secured in battle-tested vault contracts' 
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0B0E11]">
      <AnimatedBackground />
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#FCD535]/5 via-transparent to-[#0B0E11]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

      <div className="relative z-10">
        {/* Hero Section with Video Background */}
        <motion.section 
          ref={heroRef}
          className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 pb-32 relative overflow-hidden"
        >
          {/* Video Background - Enhanced HD */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover opacity-50 brightness-75"
              style={{ filter: 'contrast(1.1) saturate(1.2)' }}
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/60 via-[#0B0E11]/40 to-[#0B0E11]" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <motion.div 
            style={{ opacity, scale }}
            className="text-center max-w-6xl relative z-20"
          >
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight px-4 lg:mt-[-80px]"
              style={{ 
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 40px rgba(252, 213, 53, 0.15)'
              }}
            >
              <span className="text-white drop-shadow-2xl">Fair Token Launch Platform</span>
              <br />
              <span 
                className="bg-gradient-to-r from-[#F7931A] via-[#FCD535] to-[#F7931A] bg-clip-text text-transparent"
                style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(252, 213, 53, 0.5))'
                }}
              >
                on Stellar
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-12 leading-relaxed max-w-4xl mx-auto px-4 font-medium"
              style={{ 
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.7)'
              }}
            >
              Launch tokens with fair airdrops, task-based rewards, and automated DEX liquidity.
              All powered by Soroban smart contracts with complete on-chain transparency.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={onEnter}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(252, 213, 53, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-[#F7931A] to-[#FCD535] hover:from-[#F7931A] hover:to-[#FCD535] rounded-xl text-[#0B0E11] font-bold text-lg sm:text-xl shadow-2xl shadow-[#F7931A]/40 transition-all"
                style={{ 
                  filter: 'drop-shadow(0 8px 16px rgba(252, 213, 53, 0.3))'
                }}
              >
                Launch App
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Divider with Animation */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-[#F7931A]/50 to-transparent" 
        />

        {/* Core Features Section - Carousel */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Core Features
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
                Everything you need to launch and trade tokens on Stellar
              </p>
            </motion.div>

            {/* Mobile & Tablet: Carousel */}
            <div className="lg:hidden relative">
              <div className="relative overflow-hidden">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="bg-[#1E2329]/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#2B3139] hover:border-[#F7931A]/40 transition-all mx-auto max-w-md">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={features[currentSlide].image} 
                        alt={features[currentSlide].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300/1E2329/F7931A?text=' + features[currentSlide].title
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 to-[#FCD535]/10" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11] via-[#0B0E11]/50 to-transparent" />
                      
                      <div className="absolute bottom-4 left-4">
                        <div className="w-14 h-14 rounded-xl bg-[#1E2329]/90 backdrop-blur-sm flex items-center justify-center border border-[#F7931A]/30">
                          {(() => {
                            const Icon = features[currentSlide].icon
                            return <Icon className="w-7 h-7" style={{ color: features[currentSlide].color }} />
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-3">{features[currentSlide].title}</h3>
                      <p className="text-gray-400 leading-relaxed">
                        {features[currentSlide].description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-[#F7931A] w-8' 
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: Grid with Staggered Animation */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: i * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -15, 
                    scale: 1.03,
                    boxShadow: "0 20px 60px rgba(252, 213, 53, 0.3)"
                  }}
                  className="bg-[#1E2329]/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#2B3139] hover:border-[#F7931A]/40 transition-all cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.img 
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300/1E2329/F7931A?text=' + feature.title
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 to-[#FCD535]/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11] via-[#0B0E11]/50 to-transparent" />
                    
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="absolute bottom-4 left-4"
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#1E2329]/90 backdrop-blur-sm flex items-center justify-center border border-[#F7931A]/30">
                        <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider with Animation */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-[#FCD535]/50 to-transparent" 
        />

        {/* Why StellForge Section - Horizontal Scrollable Grid */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Why StellForge?
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
                The most advanced token launch platform on Stellar
              </p>
            </motion.div>

            {/* Horizontal Scrollable Grid */}
            <div className="relative lg:hidden">
              <div 
                ref={whyScrollRef}
                className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {whyFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="flex-shrink-0 w-80 sm:w-96 snap-start bg-[#1E2329]/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-[#2B3139] hover:border-[#FCD535]/30 transition-all"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#F7931A]/20 to-[#FCD535]/20 flex items-center justify-center mb-6 border border-[#F7931A]/20">
                      <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#F7931A]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {whyFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(252, 213, 53, 0.2)"
                  }}
                  className="bg-[#1E2329]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#2B3139] hover:border-[#FCD535]/30 transition-all cursor-pointer"
                >
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F7931A]/20 to-[#FCD535]/20 flex items-center justify-center mb-6 border border-[#F7931A]/20"
                  >
                    <feature.icon className="w-8 h-8 text-[#F7931A]" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-[#2B3139] mt-16 sm:mt-24">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/stellforge-icon.png" alt="StellForge" className="w-8 h-8" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="text-2xl font-bold text-white">StellForge</span>
            </div>
            <p className="text-gray-400 mb-4">
              Fair Token Launch Platform on Stellar Blockchain
            </p>
            <p className="text-gray-500 text-sm">
              Built with ❤️ for the Stellar ecosystem
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
