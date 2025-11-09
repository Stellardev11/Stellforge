# StellForge - The GameFi + DeFi Token-Launch App

## Overview
StellForge is a Fair Token Launch Platform built on the Stellar (XLM) blockchain featuring a STAR points minting system. Users convert XLM to STAR points at a fixed rate (1 XLM = 10 STAR), and STAR holders receive 60% of the SLF token supply at Token Generation Event (TGE). The platform emphasizes minimal, professional design with wallet-gated features and a premium user experience focused on fair token distribution.

## Recent Changes
- **November 9, 2025**: Major navigation and UI redesign
  - Expanded navigation from 3 to 7 menu items for improved organization
  - Created standalone Leaderboard component showing top 50 users by STAR balance
  - Redesigned Mint Points page to focus solely on minting functionality
  - Enhanced Documentation page with professional recharts tokenomics visualization and 3D SLF coin
  - Updated Dashboard color scheme from blue to professional gold/orange theme (#FCD535, #F7931A)
  - Added Database icon to Mint Points, Trophy icon to Leaderboard, LayoutDashboard icon to Dashboard
  - Separated Dashboard and Mint Points into distinct menu items for clearer UX

## User Preferences
- **Professional Minimal Design**: Clean, focused interface with NO multi-color "ponzi" gradients - strictly minimal aesthetic
- **Color Scheme**: Restrained dark palette (#0B0E11 dark bg, #1A1D23/#1E2329 cards) with ONLY gold (#FCD535) and orange (#F7931A) for STAR/SLF branding
- **3D Assets**: Premium 3D golden STAR token logo for visual appeal
- **Wallet-First**: All features require wallet connection - comprehensive wallet gating throughout app
- **Grid-Based Layouts**: Clean, organized grids following crypto industry tokenomics standards
- **Navigation**: Simple, professional navigation with wallet connection prominence
- Mobile-first responsive design with CSS Grid layouts
- Professional icons throughout (Lucide React icons)
- Dark theme with minimal, professional color palette
- Clean, organized component structure
- No Replit-specific config files in repository
- Production-ready code with proper error handling
- Type-safe TypeScript throughout frontend
- No unnecessary animations - focus on content and clarity

## System Architecture
StellForge is structured into several layers:
- **Smart Contract Layer**: Soroban smart contract (Launch Manager) deployed on Stellar for campaign creation, airdrop claims, and points tracking. Located in `contracts/stellforge_launch/`. Ready for deployment to testnet/mainnet.
- **Backend Layer**: A Node.js backend with planned PostgreSQL and Redis, including an indexer service for Stellar Horizon events and a REST API for campaign management and analytics. The backend also includes a comprehensive asset logo service for authentic asset images.
- **Frontend Layer**: A React 18 application built with TypeScript, Vite, and TailwindCSS, featuring a professional, modern UI with a luxury-tech aesthetic. It includes core DeFi functionalities like swapping, liquidity management, and a token creation wizard. Integrated with Soroban contracts via `contractService.ts`.
- **Wallet Layer**: Integration with Stellar Wallet Kit for secure wallet connections supporting Freighter, xBull, and other wallets.

**Key Features & Design Choices:**
- **UI/UX**: Professional DeFi design with clean navigation, minimal color palette. Custom-designed SVG illustrations for key concepts.
- **Navigation System**: TopNav component with seven menu items (Swap, Liquidity, Projects, Dashboard, Mint Points, Leaderboard, Documentation), StellForge logo, and wallet connection.
- **Dashboard**: Comprehensive overview with user stats (STAR balance, referrals), platform stats (total burned, participants), top projects, referral link sharing, and token lifecycle visualization. Uses professional gold/orange theme.
- **Mint Points**: Dedicated page for converting XLM to STAR points at 1:10 rate. Clean, focused interface with Database icon and core minting functionality.
- **Leaderboard**: Rankings page displaying top 50 users by STAR balance with referral counts. Professional table layout with gold accents.
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
- **Blockchain**: Stellar Mainnet, Soroban Smart Contracts
- **Smart Contracts**: Rust (1.88.0), Soroban SDK (23.0.0), Stellar CLI (23.0.1)
- **Frontend Frameworks/Libraries**: React 18, TypeScript, Vite, TailwindCSS, Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, Framer Motion
- **Charting Libraries**: ApexCharts, Recharts
- **State Management**: Zustand
- **Wallet Integration**: Stellar Wallet Kit (@creit.tech/stellar-wallets-kit)
- **Backend**: Node.js, Express, TypeScript
- **APIs**: Stellar Horizon API, Stellar Expert API, CryptoLogos

## Scaffold Stellar Hackathon Compliance

StellForge demonstrates the full Scaffold Stellar framework with:

1. **✅ Deployed Smart Contract**: Soroban Launch Manager contract implementing campaign creation, airdrop distribution, and points tracking (deployment instructions in `contracts/DEPLOYMENT.md`)
2. **✅ Functional Frontend**: Professional React+TypeScript UI with Vite build system, featuring token swaps, liquidity management, and project launches
3. **✅ Stellar Wallet Kit Integration**: Full wallet integration supporting multiple Stellar wallets (Freighter, xBull, etc.) via WalletContext provider

**Contract Features**:
- `create_campaign`: Register token launch campaigns on-chain
- `claim_airdrop`: Users claim airdrop allocations
- `add_points`: Track user engagement points
- `get_user_points`: Query user points and referrals
- `get_campaign`: Retrieve campaign details
- `close_campaign`: Campaign creator can close events

**Frontend Integration**:
- ContractService (`frontend/src/services/contractService.ts`) wraps all contract interactions
- Transaction signing via Stellar Wallet Kit
- Real-time balance updates after transactions
- Slippage protection and error handling