import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from './context/WalletContext'
import { TokenMarketProvider } from './context/TokenMarketContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import LandingPage from './components/LandingPage'
import SwapPage from './components/SwapPage'
import LiquidityPage from './components/LiquidityPage'
import AirdropProjects from './components/AirdropProjects'
import TokenLaunchWizard from './components/TokenLaunchWizard'
import CampaignDetail from './components/CampaignDetail'
import ProgressPage from './components/ProgressPage'
import Dashboard from './components/Dashboard'
import MintPage from './components/MintPage'
import Leaderboard from './components/Leaderboard'
import DocumentationPage from './components/DocumentationPage'
import TopNav from './components/TopNav'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

type TabType = 'swap' | 'liquidity' | 'projects' | 'dashboard' | 'mint' | 'leaderboard' | 'docs'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('swap')
  const [viewMode, setViewMode] = useState<'browse' | 'create' | 'project-detail' | 'progress'>('browse')

  const handleCreateToken = () => {
    setViewMode('create')
  }

  // Handle nav tab changes - always reset to browse mode
  const handleTabChange = (tab: TabType) => {
    setViewMode('browse')
    setActiveTab(tab)
  }

  // Show landing page first
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />
  }

  // Render create token wizard
  if (viewMode === 'create') {
    return (
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TokenMarketProvider>
            <div className="min-h-screen bg-[#0B0E11]">
              <div className="sticky top-0 z-40 bg-[#0B0E11]/98 backdrop-blur-md border-b border-[#2B3139] px-4 py-3">
                <button
                  onClick={() => {
                    setViewMode('browse')
                    setActiveTab('projects')
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
              <TokenLaunchWizard />
            </div>
          </TokenMarketProvider>
        </WalletProvider>
      </QueryClientProvider>
    )
  }

  // Render project detail view
  if (viewMode === 'project-detail') {
    return (
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TokenMarketProvider>
            <div className="min-h-screen bg-[#0B0E11]">
              <div className="sticky top-0 z-40 bg-[#0B0E11]/98 backdrop-blur-md border-b border-[#2B3139] px-4 py-3">
                <button
                  onClick={() => {
                    setViewMode('browse')
                    setActiveTab('projects')
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
              <CampaignDetail />
            </div>
          </TokenMarketProvider>
        </WalletProvider>
      </QueryClientProvider>
    )
  }

  // Render progress page
  if (viewMode === 'progress') {
    return (
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TokenMarketProvider>
            <div className="min-h-screen bg-[#0B0E11]">
              <div className="sticky top-0 z-40 bg-[#0B0E11]/98 backdrop-blur-md border-b border-[#2B3139] px-4 py-3">
                <button
                  onClick={() => {
                    setViewMode('browse')
                    setActiveTab('projects')
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
              <ProgressPage />
            </div>
          </TokenMarketProvider>
        </WalletProvider>
      </QueryClientProvider>
    )
  }

  // Main app layout
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TokenMarketProvider>
            <div className="min-h-screen bg-[#0B0E11]">
              <TopNav 
                activeTab={activeTab} 
                setActiveTab={handleTabChange}
              />
              
              {activeTab === 'swap' && <SwapPage />}
              
              {activeTab === 'liquidity' && <LiquidityPage />}
              
              {activeTab === 'projects' && (
                <AirdropProjects 
                  onViewProject={() => {
                    setViewMode('project-detail')
                  }}
                  onCreateProject={handleCreateToken}
                />
              )}

              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}

              {activeTab === 'mint' && <MintPage />}

              {activeTab === 'leaderboard' && <Leaderboard />}

              {activeTab === 'docs' && <DocumentationPage />}
            </div>
          </TokenMarketProvider>
        </WalletProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
