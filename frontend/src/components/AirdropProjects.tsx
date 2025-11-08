import { Search, Sparkles, Users, CheckCircle2, Twitter, MessageCircle, Send } from 'lucide-react'
import { useTokenMarket } from '../context/TokenMarketContext'
import { useState } from 'react'

interface AirdropProjectsProps {
  onViewProject: (projectId: string) => void
  onCreateProject: () => void
}

export default function AirdropProjects({ onViewProject, onCreateProject }: AirdropProjectsProps) {
  const { airdropProjects } = useTokenMarket()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const getProjectStats = (project: any) => {
    const maxParticipants = Math.floor(project.marketCap / 100) || 1000
    const currentParticipants = project.holders || 0
    const isCompleted = currentParticipants >= maxParticipants
    const participationPercent = (currentParticipants / maxParticipants) * 100
    const tasksCount = 4
    const airdropPool = project.marketCap * 0.4
    const referralBonus = Math.floor(airdropPool * 0.1)

    return {
      maxParticipants,
      currentParticipants,
      isCompleted,
      participationPercent,
      tasksCount,
      airdropPool,
      referralBonus
    }
  }

  const filteredProjects = airdropProjects
    .filter(project => {
      const stats = getProjectStats(project)
      if (filter === 'active') return !stats.isCompleted
      if (filter === 'completed') return stats.isCompleted
      return true
    })
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Projects</h1>
            <p className="text-xs text-gray-400 mt-1">Earn tokens by completing tasks</p>
          </div>
          <button
            onClick={onCreateProject}
            className="px-4 py-2 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-semibold rounded text-sm transition-all"
          >
            Create
          </button>
        </div>
          
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E2329] border border-[#2B3139] rounded pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FCD535] transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'active'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'completed'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Compact Project List */}
      <div className="px-4 space-y-2">
        {filteredProjects.map((project) => {
          const stats = getProjectStats(project)
          
          return (
            <button
              key={project.id}
              onClick={() => onViewProject(project.id)}
              className="w-full bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] hover:border-[#FCD535]/30 rounded p-3 transition-all text-left"
            >
              {/* Main Row */}
              <div className="flex items-start gap-3 mb-3">
                {/* Project Icon & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <img 
                      src={project.image} 
                      alt={project.name} 
                      className="w-10 h-10 rounded-lg border border-[#2B3139]" 
                    />
                    {!stats.isCompleted && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 bg-[#FCD535] rounded-full">
                        <Sparkles size={8} className="text-[#0B0E11]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white truncate">{project.name}</h3>
                      <span className="text-gray-500 text-xs">{project.symbol}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {stats.isCompleted ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-400">
                    <CheckCircle2 size={12} />
                    <span>Full</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#0ECB81]/10 border border-[#0ECB81]/30 rounded text-xs text-[#0ECB81]">
                    <Sparkles size={12} />
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-[#0B0E11]/50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Pool</p>
                  <p className="text-sm font-semibold text-white truncate">{stats.airdropPool.toLocaleString()}</p>
                </div>
                <div className="bg-[#0B0E11]/50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Tasks</p>
                  <p className="text-sm font-semibold text-white">{stats.tasksCount}</p>
                </div>
                <div className="bg-[#0B0E11]/50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Reward</p>
                  <p className="text-sm font-semibold text-[#FCD535] truncate">{stats.referralBonus.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">Participants</span>
                  </div>
                  <span className="text-xs text-white font-medium">
                    {stats.currentParticipants} / {stats.maxParticipants}
                  </span>
                </div>
                <div className="relative h-1.5 bg-[#0B0E11] rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-[#FCD535] rounded-full transition-all"
                    style={{ width: `${Math.min(stats.participationPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2B3139]">
                <div className="flex items-center gap-1 flex-1">
                  {project.twitter && (
                    <a
                      href={project.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-[#FCD535]/10 rounded"
                    >
                      <Twitter size={14} className="text-gray-500 hover:text-[#FCD535]" />
                    </a>
                  )}
                  {project.discord && (
                    <a
                      href={project.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-[#FCD535]/10 rounded"
                    >
                      <MessageCircle size={14} className="text-gray-500 hover:text-[#FCD535]" />
                    </a>
                  )}
                  <a
                    href="#"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 hover:bg-[#FCD535]/10 rounded"
                  >
                    <Send size={14} className="text-gray-500 hover:text-[#FCD535]" />
                  </a>
                </div>
                <div className="text-xs text-gray-500">
                  Entry: <span className="text-white font-medium">1 XLM</span>
                </div>
              </div>
            </button>
          )
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex p-4 bg-[#1E2329] rounded-2xl mb-4">
              <Sparkles className="text-gray-500" size={40} />
            </div>
            <p className="text-white mb-1 font-medium">No {filter} projects found</p>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Be the first to create one'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateProject}
                className="px-6 py-2.5 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-semibold rounded text-sm transition-all"
              >
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
