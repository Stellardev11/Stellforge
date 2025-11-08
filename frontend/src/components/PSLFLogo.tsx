import pslfLogo from '@assets/generated_images/3D_golden_pSLF_coin_logo_a74a3ab9.png';

interface PSLFLogoProps {
  size?: number;
  className?: string;
}

export default function PSLFLogo({ size = 24, className = '' }: PSLFLogoProps) {
  return (
    <img 
      src={pslfLogo} 
      alt="pSLF" 
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
