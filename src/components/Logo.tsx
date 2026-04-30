import React from 'react';

interface LogoProps {
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ height = 80, className = "" }) => {
  return (
    <div className={`logo-container ${className}`} style={{ height: height, display: 'flex', alignItems: 'center', gap: '4px' }}>
      {/* Using the image file for the icon to ensure 100% accuracy as requested */}
      <img 
        src="/logo-icon.png" 
        alt="Eterna Logo Icon" 
        style={{ height: '100%', width: 'auto', display: 'block' }} 
      />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '-2px' }}>
        <span style={{ 
          fontFamily: "'Poppins', sans-serif", 
          fontWeight: 600, 
          fontSize: `${height * 0.45}px`, 
          color: '#004B87',
          lineHeight: 0.9,
          letterSpacing: '0.5px'
        }}>
          ETERNA
        </span>
        <span style={{ 
          fontFamily: "'Poppins', sans-serif", 
          fontWeight: 600, 
          fontSize: `${height * 0.4}px`, 
          color: '#F5C518',
          lineHeight: 0.9
        }}>
          PET HOSPITAL
        </span>
      </div>
    </div>
  );
};

export default Logo;
