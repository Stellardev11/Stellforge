import { useState } from 'react'
import { getAssetLogoUrl, getTokenColor, getAssetInitials } from '../utils/tokenLogos'

interface AssetIconProps {
  assetCode: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AssetIcon({ assetCode, imageUrl, size = 'md', className = '' }: AssetIconProps) {
  const [imgError, setImgError] = useState(false)
  const logoUrl = getAssetLogoUrl(assetCode, imageUrl)
  const colors = getTokenColor(assetCode)
  const initials = getAssetInitials(assetCode)

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm'
  }

  if (logoUrl && !imgError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden flex items-center justify-center bg-white border-2 border-white/10`}>
        <img
          src={logoUrl}
          alt={assetCode}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center font-bold bg-gradient-to-br text-white border-2 border-white/10`}
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`
      }}
    >
      {initials}
    </div>
  )
}
