/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Bitcoin & Binance Theme
        'bitcoin-gold': '#F7931A',
        'bitcoin-orange': '#F7931A',
        'bitcoin-orange-dark': '#D97706',
        'bitcoin-orange-light': '#FFA726',
        'binance-yellow': '#FCD535',
        'binance-dark': '#1E2329',
        
        // Stellar Cyan Theme  
        'stellar-cyan': '#00C4FF',
        'stellar-cyan-dark': '#0099CC',
        'stellar-cyan-light': '#33D1FF',
        
        // Professional Grey Scale
        'eth-grey': '#8c8c8c',
        'eth-grey-light': '#ecf0f1',
        'eth-grey-medium': '#c6c5d4',
        'eth-grey-dark': '#3c3c3d',
        
        // Professional Dark Backgrounds (Binance-style)
        'pro-dark': '#0B0E11',
        'pro-dark-lighter': '#1E2329',
        'pro-dark-card': '#181A20',
        
        // Premium Accent Colors
        'accent-gold': '#FCD535',
        'accent-green': '#00C087',
        'accent-red': '#F84960',
        'accent-blue': '#0D579B',
        
        // Legacy colors for compatibility
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
        stellar: {
          navy: '#0F1F38',
          'dark-blue': '#134E9C',
          'bright-blue': '#3BA3FF',
          black: '#030712',
          white: '#FFFFFF',
          gold: '#F8C365',
          'gray-100': '#F9FAFB',
          'gray-200': '#F3F4F6',
          'gray-300': '#E5E7EB',
          'gray-400': '#D1D5DB',
          'gray-500': '#9CA3AF',
          'gray-600': '#6B7280',
          'gray-700': '#4B5563',
          'gray-800': '#374151',
          'gray-900': '#1F2937',
          accent: '#00C4FF',
          'accent-dark': '#0099CC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 20px rgba(59, 163, 255, 0.4)',
        'glow-lg': '0 0 40px rgba(59, 163, 255, 0.6)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        '3d': '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(0, 0, 0, 0.2)',
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(176, 38, 255, 0.5), 0 0 40px rgba(176, 38, 255, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 148, 0.5), 0 0 40px rgba(0, 255, 148, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 46, 151, 0.5), 0 0 40px rgba(255, 46, 151, 0.3)',
        'cyber-glow': '0 0 30px rgba(0, 217, 255, 0.4), 0 0 60px rgba(176, 38, 255, 0.3)',
      },
      backgroundImage: {
        'starglow-gradient': 'linear-gradient(135deg, #134E9C 0%, #3BA3FF 100%)',
        'dark-gradient': 'linear-gradient(180deg, #030712 0%, #0F1F38 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #00D9FF 0%, #B026FF 100%)',
        'neon-gradient': 'linear-gradient(135deg, #FF2E97 0%, #00D9FF 50%, #00FF94 100%)',
        'purple-pink': 'linear-gradient(135deg, #B026FF 0%, #FF2E97 100%)',
        'green-cyan': 'linear-gradient(135deg, #00FF94 0%, #00D9FF 100%)',
        'cyber-dark': 'linear-gradient(180deg, #050814 0%, #0A0E27 100%)',
        'cyber-radial': 'radial-gradient(circle at 50% 0%, rgba(0, 217, 255, 0.15) 0%, transparent 50%)',
        'neon-radial': 'radial-gradient(circle at 50% 50%, rgba(176, 38, 255, 0.2) 0%, rgba(0, 217, 255, 0.1) 50%, transparent 100%)',
        'grid-pattern': 'linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '10px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'neon-pulse': 'neon-pulse 1.5s ease-in-out infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'cyber-flicker': 'cyber-flicker 0.15s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 163, 255, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 163, 255, 0.8)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(176, 38, 255, 0.2)',
            opacity: '1',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(176, 38, 255, 0.4)',
            opacity: '0.9',
          },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 10px rgba(0, 217, 255, 0.8), 0 0 20px rgba(0, 217, 255, 0.5)',
          },
          '50%': { 
            textShadow: '0 0 20px rgba(0, 217, 255, 1), 0 0 30px rgba(0, 217, 255, 0.7), 0 0 40px rgba(176, 38, 255, 0.5)',
          },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'cyber-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
}
