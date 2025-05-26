import { CircularProgress } from '@mui/material';

export function LoadingSpinner({ size = 'medium', text, center = false }) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56
  };
  
  const spinnerSize = sizeMap[size] || sizeMap.medium;
  
  return (
    <div className={`flex flex-col items-center ${center ? 'justify-center min-h-[200px]' : ''}`}>
      <CircularProgress 
        size={spinnerSize} 
        thickness={4} 
        sx={{ 
          color: theme => theme.palette.primary.main 
        }} 
      />
      {text && (
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}