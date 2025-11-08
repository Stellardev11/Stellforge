import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

interface Token {
  id: string
  name: string
  symbol: string
  logo: string
  marketCap: string
  volume24h: string
  change24h: number
  holders: number
}

interface TokenCarouselProps {
  tokens: Token[]
  title: string
  onViewToken?: (tokenId: string) => void
}

export default function TokenCarousel({ tokens, title, onViewToken }: TokenCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (tokens.length === 0) return
    
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % tokens.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [tokens.length])

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % tokens.length
      } else {
        return prev === 0 ? tokens.length - 1 : prev - 1
      }
    })
  }

  if (tokens.length === 0) return null

  const currentToken = tokens[currentIndex]

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      
      <div className="relative bg-[#1E2329]/80 backdrop-blur-xl rounded-2xl border border-[#2B3139] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F7931A]/20 to-[#FCD535]/20 flex items-center justify-center border border-[#F7931A]/30 flex-shrink-0">
                <span className="text-3xl font-bold text-[#FCD535]">
                  {currentToken.symbol?.charAt(0) || 'T'}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">{currentToken.name}</h3>
                  <span className="text-gray-400 text-lg">{currentToken.symbol}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Market Cap</div>
                    <div className="text-white font-bold text-lg">{currentToken.marketCap}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">24h Volume</div>
                    <div className="text-white font-bold text-lg">{currentToken.volume24h}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">24h Change</div>
                    <div className={`font-bold text-lg flex items-center gap-1 ${currentToken.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {currentToken.change24h >= 0 ? '+' : ''}{currentToken.change24h}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Holders</div>
                    <div className="text-white font-bold text-lg">{currentToken.holders.toLocaleString()}</div>
                  </div>
                </div>

                {onViewToken && (
                  <button
                    onClick={() => onViewToken(currentToken.id)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-[#F7931A] to-[#FCD535] hover:from-[#F7931A]/90 hover:to-[#FCD535]/90 rounded-lg text-[#0B0E11] font-semibold text-sm transition-all hover:scale-105"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => paginate(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0B0E11]/80 hover:bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => paginate(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0B0E11]/80 hover:bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {tokens.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-[#FCD535] w-8' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
