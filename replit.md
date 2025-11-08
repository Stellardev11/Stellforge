# StellForge - The GameFi + DeFi Token-Launch App

## Overview
StellForge is a professional token creation and DEX platform built on the Stellar (XLM) blockchain. It enables users to create and manage tokens, swap assets on Stellar DEX, provide liquidity, and manage project airdrops within a clean, professional DeFi interface. The platform focuses on simplicity, security, and seamless Stellar blockchain integration, providing users with essential DeFi tools in a modern, minimal interface.

## User Preferences
- **Professional Minimal Design**: Clean, focused DeFi interface with simplified navigation and clear feature separation
- **Color Scheme**: Minimal professional palette (#0B0E11 dark bg, #1E2329 cards, #FCD535 yellow accent, #F7931A orange accent)
- **Navigation**: Three main tabs (Swap, Liquidity, Projects) with professional StellForge logo and wallet button
- **Compact Layouts**: Professional card layouts with clean spacing and organized grids
- **Typography**: "Projects" terminology for airdrop campaigns throughout the app
- **Stellar DEX Focus**: Native integration with Stellar blockchain for swaps and liquidity provision
- Mobile-first responsive design with CSS Grid layouts
- Professional icons throughout (Lucide React icons)
- Dark theme with professional color palette
- Clean, organized component structure
- No Replit-specific config files in repository
- Production-ready code with proper error handling
- Type-safe TypeScript throughout frontend
- Generous spacing with responsive breakpoints (sm, md, lg, xl)
- Framer Motion animations for professional transitions

## System Architecture
StellForge is structured into several layers:
- **Smart Contract Layer**: Rust-based Soroban smart contracts for token creation, secure escrow, airdrop management, referral tracking, staking, and liquidity management.
- **Backend Layer**: A Node.js backend with planned PostgreSQL and Redis, including an indexer service for Stellar Horizon events and a REST API for campaign management and analytics. The backend also includes a comprehensive asset logo service for authentic asset images.
- **Frontend Layer**: A React 18 application built with TypeScript, Vite, and TailwindCSS, featuring a professional, modern UI with a luxury-tech aesthetic. It includes core DeFi functionalities like swapping, liquidity management, and a token creation wizard.
- **Wallet Layer**: Integration with Stellar Wallet Kit for secure wallet connections.

**Key Features & Design Choices:**
- **UI/UX**: Professional DeFi design with clean navigation, minimal color palette. Custom-designed SVG illustrations for key concepts.
- **Navigation System**: TopNav component with three main tabs (Swap, Liquidity, Projects), StellForge logo, and wallet connection.
- **Swap Interface**: Stellar DEX token swap functionality with real-time balance display, slippage tolerance, and wallet integration. Redesigned for mobile-first experience with vertical token selection and full-width buttons.
- **Liquidity Management**: View active liquidity pools, add/remove liquidity, and track user positions and statistics.
- **Token Creation Wizard**: Simplified 3-step process:
  - **Step 1 - Token Setup**: Name, symbol, supply, description, logo
  - **Step 2 - Allocation Settings**: Airdrop % (min 10%), Liquidity % (min 10%), remaining auto-calculated for creator. Minimum 10,000 XLM liquidity requirement. Optional vesting/lockup for creator allocation.
  - **Step 3 - Event & Launch**: Event duration (3-7 days), auto DEX launch when event ends, airdrop distribution based on entries and referral ranking.
- **Progress Page**: Track airdrop participation with referral links, stats, leaderboard rankings, and claimable rewards. Shows entry counts, referral counts, estimated/claimable tokens.
- **Projects Platform**: Entry-based airdrop participation with referral reward system for bringing participants.
- **Referral System**: Each participant gets unique referral link, earns bonus entries and tokens for referrals, leaderboard ranking affects final distribution.
- **Backend API**: REST endpoints for token creation with validation, airdrop join/claim, referral tracking, and progress monitoring. Full server-side validation mirrors frontend safeguards.
- **3D Graphics**: Three.js and React Three Fiber for dynamic landing page visuals.
- **State Management**: Zustand for efficient application state.
- **Wallet Integration**: Stellar Wallet Kit supporting Freighter, xBull, and other Stellar wallets.
- **Accessibility**: Reduced-motion support and responsive design for all devices.
- **Deployment**: Express backend serves both API and built frontend in production; Vite proxy for development.

## External Dependencies
- **Blockchain**: Stellar, Soroban
- **Smart Contracts**: Rust, Soroban SDK
- **Frontend Frameworks/Libraries**: React 18, TypeScript, Vite, TailwindCSS, Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, Framer Motion
- **Charting Libraries**: ApexCharts, Recharts
- **State Management**: Zustand
- **Wallet Integration**: Stellar Wallet Kit
- **Backend (Planned)**: Node.js, PostgreSQL, Redis
- **APIs**: Stellar Horizon API, Stellar Expert API, CryptoLogos