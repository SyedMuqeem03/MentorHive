import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TextField, 
  Button, 
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  Box,
  Typography,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const user = await login(email, password);
      
      // Redirect based on user role
      redirectUserBasedOnRole(user);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Try again later.');
      } else {
        setError('Failed to log in: ' + (err.message || 'Unknown error'));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      
      const user = await loginWithGoogle();
      
      // Use the same redirection function
      redirectUserBasedOnRole(user);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else {
        setError('Failed to sign in with Google: ' + (err.message || 'Unknown error'));
      }
      console.error("Google sign in error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Create a shared redirection function
  const redirectUserBasedOnRole = (user) => {
    if (user.role === 'student') {
      if (user.hasCompletedProfile) {
        navigate('/student-home');
      } else {
        navigate('/student-form');
      }
    } else if (user.role === 'mentor') {
      navigate('/mentor-home');
    } else {
      // Fallback for any unexpected role
      console.warn('Unknown user role:', user.role);
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <Alert 
          severity="error" 
          variant="outlined" 
          className="mb-4"
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          fullWidth
          label="Email address"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon className="text-gray-500" />
              </InputAdornment>
            ),
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
          className="bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon className="text-gray-500" />
              </InputAdornment>
            ),
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
            ),
          }}
        />

        <div className="flex items-center justify-between">
          <FormControlLabel
            control={
              <Checkbox 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
                className="text-blue-600"
              />
            }
            label={<span className="text-sm text-gray-600">Remember me</span>}
          />
          
          <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || googleLoading}
          className="normal-case py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white hover:shadow-lg transition-all duration-200"
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Signing in...
            </Box>
          ) : 'Sign in'}
        </Button>
      </form>
      
      <div className="mt-6">
        <Divider className="my-4">
          <Typography variant="body2" className="text-gray-500 px-2">
            OR CONTINUE WITH
          </Typography>
        </Divider>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            fullWidth
            variant="outlined"
            startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="normal-case py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Google
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            disabled={loading || googleLoading}
            className="normal-case py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            GitHub
          </Button>
        </div>
      </div>
      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </Typography>
      </Box>
    </div>
  );
}

export default Login;