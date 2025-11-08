import { BookOpen, Coins, Zap, Users, Trophy, Shield, Rocket } from 'lucide-react';
import pSlfLogo from '../assets/pslf-logo.png';
import slfCoin from '../assets/slf-coin.png';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0B0E11] pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-12 h-12 text-[#FCD535]" />
            <h1 className="text-4xl font-bold text-white">StellForge Documentation</h1>
          </div>
          <p className="text-xl text-gray-400">
            Complete guide to the StellForge platform and SLF token ecosystem
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-[#FCD535]" />
              Platform Overview
            </h2>
            <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6 text-gray-300 space-y-4">
              <p>
                StellForge is a comprehensive DeFi platform built on the Stellar blockchain, designed to democratize 
                token creation, trading, and liquidity provision. Our platform offers a no-code solution for launching 
                fair and transparent token projects.
              </p>
              <p>
                <strong className="text-white">Core Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Swap:</strong> Trade tokens on Stellar DEX with competitive rates and minimal slippage</li>
                <li><strong>Liquidity:</strong> Provide liquidity and earn fees from trading activity</li>
                <li><strong>Projects:</strong> Launch tokens with fair airdrop mechanics and automated liquidity</li>
                <li><strong>Points System:</strong> Earn pSLF points and participate in platform growth</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <img src={pSlfLogo} alt="pSLF" className="w-8 h-8" />
              pSLF Points System
            </h2>
            <div className="bg-gradient-to-br from-[#FCD535]/10 to-[#F7931A]/10 border border-[#FCD535]/30 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">What are pSLF Points?</h3>
              <p className="text-gray-300">
                pSLF (platform SLF) points are non-transferable loyalty points that represent your participation 
                in the StellForge ecosystem. They will be converted to SLF tokens at the Token Generation Event (TGE).
              </p>

              <h3 className="text-xl font-bold text-white mt-6">How to Earn pSLF Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-[#FCD535]" />
                    <h4 className="font-semibold text-white">Minting</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Mint pSLF points directly by sending XLM. Rate: <strong className="text-[#FCD535]">1 XLM = 1 pSLF</strong>
                  </p>
                </div>

                <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-[#FCD535]" />
                    <h4 className="font-semibold text-white">Platform Usage</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Earn 1 pSLF for every 1 XLM spent on swaps, liquidity, and token launches
                  </p>
                </div>

                <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[#FCD535]" />
                    <h4 className="font-semibold text-white">Referrals</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Earn <strong className="text-[#FCD535]">5 pSLF</strong> for each successful referral
                  </p>
                </div>

                <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-[#FCD535]" />
                    <h4 className="font-semibold text-white">Tasks</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Complete social and platform tasks to earn 20-100 pSLF per task
                  </p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-green-400 mb-2">Early User Bonus</h4>
                <p className="text-sm text-gray-300">
                  The first <strong className="text-green-400">20,000 users</strong> receive a one-time bonus of{' '}
                  <strong className="text-green-400">10 free pSLF points</strong> when they join!
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <img src={slfCoin} alt="SLF" className="w-8 h-8" />
              SLF Token Tokenomics
            </h2>
            <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Token Distribution</h3>
              <div className="space-y-4">
                <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Total Supply</span>
                    <span className="text-2xl font-bold text-white">100,000,000 SLF</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">pSLF Points Holders</h4>
                        <p className="text-sm text-gray-400">Distributed to pSLF holders at TGE</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#FCD535]">60%</div>
                        <div className="text-sm text-gray-400">60M SLF</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">Listing Reserve</h4>
                        <p className="text-sm text-gray-400">DEX liquidity and market making</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">15%</div>
                        <div className="text-sm text-gray-400">15M SLF</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">Team</h4>
                        <p className="text-sm text-gray-400">Core team allocation with vesting</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">15%</div>
                        <div className="text-sm text-gray-400">15M SLF</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">Launch</h4>
                        <p className="text-sm text-gray-400">Initial launch and marketing</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">5%</div>
                        <div className="text-sm text-gray-400">5M SLF</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">Other</h4>
                        <p className="text-sm text-gray-400">Partnerships and future development</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">5%</div>
                        <div className="text-sm text-gray-400">5M SLF</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-purple-400 mb-2">Distribution at TGE</h4>
                  <p className="text-sm text-gray-300">
                    When the SLF token launches, the 60M tokens allocated to pSLF holders will be distributed 
                    proportionally based on each user's share of total pSLF points.
                  </p>
                  <p className="text-sm text-purple-300 mt-2">
                    <strong>Formula:</strong> Your SLF = (Your pSLF / Total pSLF) × 60,000,000
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#FCD535]" />
              Security & Fair Launch
            </h2>
            <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6 text-gray-300 space-y-4">
              <h3 className="text-xl font-bold text-white">Anti-Fraud Measures</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">IP Tracking:</strong> Prevent multiple accounts from same location</li>
                <li><strong className="text-white">Device Fingerprinting:</strong> Detect and block bot activities</li>
                <li><strong className="text-white">Rate Limiting:</strong> Prevent spam and abuse of the system</li>
                <li><strong className="text-white">Wallet Verification:</strong> Ensure one bonus per unique wallet</li>
              </ul>

              <h3 className="text-xl font-bold text-white mt-6">Fair Distribution</h3>
              <p>
                The platform ensures fair distribution of both pSLF points and SLF tokens through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Transparent 1:1 minting ratio for all participants</li>
                <li>No preferential treatment or insider advantages</li>
                <li>Public tracking of total XLM received and pSLF minted</li>
                <li>Open-source smart contracts for token distribution</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Getting Started</h2>
            <div className="bg-gradient-to-r from-[#FCD535]/10 to-[#F7931A]/10 border border-[#FCD535]/30 rounded-lg p-6">
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-lg font-bold">
                    1
                  </span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Connect Your Wallet</h4>
                    <p className="text-gray-300 text-sm">
                      Connect your Stellar wallet (Freighter, xBull, etc.) to start using the platform
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-lg font-bold">
                    2
                  </span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Claim Your Bonus</h4>
                    <p className="text-gray-300 text-sm">
                      If you're one of the first 20,000 users, claim your free 10 pSLF points
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-lg font-bold">
                    3
                  </span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Mint pSLF Points</h4>
                    <p className="text-gray-300 text-sm">
                      Convert XLM to pSLF points at 1:1 ratio to maximize your token allocation
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-lg font-bold">
                    4
                  </span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Earn More Points</h4>
                    <p className="text-gray-300 text-sm">
                      Use the platform, refer friends, and complete tasks to earn additional pSLF
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-lg font-bold">
                    5
                  </span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Receive SLF at TGE</h4>
                    <p className="text-gray-300 text-sm">
                      Your pSLF points will be converted to SLF tokens proportionally to your share
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
            <p className="text-gray-300 mb-4">
              Join our community channels for support, updates, and discussions:
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="text-[#FCD535] hover:text-[#F7931A] transition-colors">Discord</a>
              <a href="#" className="text-[#FCD535] hover:text-[#F7931A] transition-colors">Twitter</a>
              <a href="#" className="text-[#FCD535] hover:text-[#F7931A] transition-colors">Telegram</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
