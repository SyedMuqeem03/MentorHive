// Create a new file: src/components/common/Logo.jsx
import { School as SchoolIcon } from '@mui/icons-material';

function Logo({ size = 'medium', variant = 'default' }) {
  const sizes = {
    small: { icon: 24, container: 'w-8 h-8' },
    medium: { icon: 32, container: 'w-12 h-12' },
    large: { icon: 48, container: 'w-16 h-16' },
    xl: { icon: 64, container: 'w-20 h-20' }
  };

  const variants = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600',
    white: 'bg-white border-2 border-blue-200',
    transparent: 'bg-transparent'
  };

  return (
    <div className={`${sizes[size].container} ${variants[variant]} rounded-full flex items-center justify-center shadow-lg`}>
      <SchoolIcon 
        sx={{ 
          fontSize: sizes[size].icon, 
          color: variant === 'white' ? '#2563EB' : 'white' 
        }} 
      />
    </div>
  );
}

export default Logo;