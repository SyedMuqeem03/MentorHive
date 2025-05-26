import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  TextField, 
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  LightbulbOutlined as LightbulbIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { colors } from '../lib/theme';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Effect to hide navbar
  useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => document.body.classList.remove('hide-navbar');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // If we have a warning, show it but still proceed
        if (result.warning) {
          console.warn(result.warning);
          // You could show a non-blocking toast/alert here
        }
        
        // Redirect based on role, with fallbacks for offline mode
        if (result.user.role === 'student') {
          navigate('/student-home');
        } else if (result.user.role === 'mentor') {
          navigate('/mentor-home');
        } else {
          // If role is unknown, navigate to a generic dashboard
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Failed to log in');
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Special handling for offline errors
      if (!navigator.onLine || err.message?.includes('offline')) {
        setError('You are currently offline. Internet connection required for login.');
      } else {
        setError('Failed to log in: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/student-home');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 order-2 md:order-1">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome back
            </span>
          </h2>
          <p className="text-center text-sm text-gray-500 mt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 sm:rounded-xl shadow-xl transform transition-all hover:shadow-2xl">
            {error && (
              <Alert severity="error" className="mb-4" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="Email address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-50"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'rgb(59, 130, 246)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(79, 70, 229)',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgb(79, 70, 229)',
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-50"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'rgb(124, 58, 237)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(139, 92, 246)',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'rgb(124, 58, 237)',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <div className="flex items-center justify-between">
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: 'rgb(209, 213, 219)',
                        '&.Mui-checked': {
                          color: 'rgb(79, 70, 229)',
                        },
                      }}
                    />
                  }
                  label={<span className="text-sm text-gray-600">Remember me</span>}
                />
                
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="normal-case py-3 rounded-lg"
                sx={{
                  background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(124, 58, 237))',
                  '&:hover': {
                    background: 'linear-gradient(to right, rgb(29, 78, 216), rgb(109, 40, 217))',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
              </Button>
              
              <div className="relative my-4">
                <Divider>
                  <span className="text-xs text-gray-500 px-2 font-medium">OR CONTINUE WITH</span>
                </Divider>
              </div>
              
              {/* Replace the grid with a single centered button */}
              <div className="mt-6">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} color="inherit" /> : (
                      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                      </svg>
                    )
                  }
                  onClick={handleGoogleSignIn}
                  className="normal-case py-3"
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#757575',
                    textTransform: 'none',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    border: '1px solid #dadce0',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                  }}
                >
                  Sign in with Google
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Right content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden order-1 md:order-2">
        {/* Background Elements - Blob animations */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10">
          <div className="h-16 w-16 bg-white/10 backdrop-filter backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Welcome Back!</h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Log in to continue your journey with our mentoring community and unlock your full learning potential.
          </p>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-lg p-6 transform transition-all hover:scale-105 duration-300">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center mb-4">
                <LightbulbIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Learning</h3>
              <p className="text-blue-100">Connect with mentors who understand your learning style and can help you overcome academic challenges.</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-lg p-6 transform transition-all hover:scale-105 duration-300">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center mb-4">
                <TimelineIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
              <p className="text-blue-100">Monitor your growth with detailed insights and track your improvement over time.</p>
            </div>
          </div>
        </div>
        
        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10 opacity-30">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-24">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-white"></path>
          </svg>
        </div>
        
        <div className="relative z-10 text-blue-100 text-sm mt-8">
          © {new Date().getFullYear()} Mentoring Portal. All rights reserved.
        </div>
      </div>
      
      <style>
        {`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          /* Hide navbar when this class is present */
          :global(body.hide-navbar) :global(nav) {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
}

export default LoginPage;