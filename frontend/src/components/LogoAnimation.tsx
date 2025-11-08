import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function LogoAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 600

    let time = 0
    let animationFrameId: number

    const drawGradientOrbs = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 3; i++) {
        const angle = time + (i * Math.PI * 2) / 3
        const x = canvas.width / 2 + Math.cos(angle) * 150
        const y = canvas.height / 2 + Math.sin(angle) * 100

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 180)
        gradient.addColorStop(0, i === 0 ? 'rgba(252, 213, 53, 0.3)' : i === 1 ? 'rgba(247, 147, 26, 0.2)' : 'rgba(255, 200, 0, 0.25)')
        gradient.addColorStop(1, 'rgba(252, 213, 53, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    const animate = () => {
      time += 0.008
      drawGradientOrbs()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-60 blur-xl"
        width={800}
        height={600}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/stellforge-icon.png" 
          alt="StellForge" 
          className="w-32 h-32 md:w-40 md:h-40 opacity-20 blur-sm"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FCD535]/5 to-transparent animate-pulse-slow" />
    </div>
  )
}
