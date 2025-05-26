import { useState, useEffect } from 'react';
import { 
  Stepper, Step, StepLabel, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Chip,
  FormHelperText, Alert, Typography, CircularProgress,
  Box, Paper, StepConnector
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createStudentProfile } from '../../utils/api';
import { 
  Check as CheckIcon, 
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon
} from '@mui/icons-material';

// Define a consistent color system
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
  },
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    700: '#047857',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
  }
};

// Custom styled components for enhanced visual appearance
const StyledStepConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-root': {
    marginLeft: 12,
    marginRight: 12,
  },
  '&.MuiStepConnector-active': {
    '& .MuiStepConnector-line': {
      borderColor: colors.primary[500],
    },
  },
  '&.MuiStepConnector-completed': {
    '& .MuiStepConnector-line': {
      borderColor: colors.primary[500],
    },
  },
  '& .MuiStepConnector-line': {
    borderColor: colors.neutral[300],
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const StyledStep = styled(StepLabel)(({ theme }) => ({
  '& .MuiStepLabel-iconContainer': {
    '& .MuiStepIcon-root': {
      color: colors.neutral[300],
      '&.Mui-active': {
        color: colors.primary[600],
      },
      '&.Mui-completed': {
        color: colors.success[500],
      },
    }
  },
  '& .MuiStepLabel-label': {
    fontWeight: 500,
    '&.Mui-active': {
      color: colors.primary[700],
      fontWeight: 600,
    },
    '&.Mui-completed': {
      color: colors.success[700],
      fontWeight: 600,
    }
  }
}));

const SUBJECTS = [
  { id: 1, name: 'Machine Learning', icon: '🤖' },
  { id: 2, name: 'Artificial Intelligence', icon: '🧠' },
  { id: 3, name: 'Formal Languages and Automata Theory', icon: '🔤' },
  { id: 4, name: 'Scripting Languages', icon: '📜' },
  { id: 5, name: 'Fundamentals of Internet of Things', icon: '📱' },
  { id: 6, name: 'Environmental Science', icon: '🌍' },
  { id: 7, name: 'IOMP', icon: '📊' }
];

// Options for year and semester
const YEARS = ["1st", "2nd", "3rd", "4th"];
const SEMESTERS = ["1st", "2nd"];

function StudentForm() {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const { currentUser, updateUserData } = useAuth();
  const navigate = useNavigate();

  // Log the current route on component mount
  useEffect(() => {
    console.log("Current route:", window.location.pathname);
  }, []);

  // Add these console logs to help debug
  console.log("Navigate function available:", !!navigate);
  console.log("Current user:", currentUser);

  // Modified handleSubmit function with better error handling and navigation
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Make sure we find the matching subjects correctly
      const selectedSubjectsData = selectedSubjects
        .map(id => SUBJECTS.find(subject => subject.id === id))
        .filter(subject => subject !== undefined); // Filter out any undefined values
    
      const studentData = {
        name,
        rollNo,
        department,
        year,
        semester,
        userId: currentUser.uid,
        subjects: selectedSubjectsData,
        hasCompletedProfile: true
      };
      
      console.log("Submitting student data:", studentData);
      
      // Save to API
      const result = await createStudentProfile(studentData);
      console.log("Profile creation result:", result);
      
      // Use a more reliable navigation method
      setTimeout(() => {
        // Force a page redirect rather than using React Router navigation
        window.location.href = '/student-home';
      }, 500);
      
    } catch (err) {
      console.error('Error creating student profile:', err);
      setError('Failed to save profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const validateStep1 = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!rollNo.trim()) newErrors.rollNo = 'Roll number is required';
    if (!department) newErrors.department = 'Department is required';
    if (!year) newErrors.year = 'Year is required';
    if (!semester) newErrors.semester = 'Semester is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleSubmit();
    }
  };
  
  const prevStep = () => {
    setCurrentStep(1);
  };

  // Add this function definition to your StudentForm component
  const handleSubjectToggle = (id) => {
    // Don't convert to string, keep the ID in its original format (number)
    setSelectedSubjects(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mt: 4, 
      mb: 8,
      px: 2
    }}>
      {/* Header with logo */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: 4
      }}>
        <Box sx={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.secondary[600]})`,
          mb: 2
        }}>
          <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700,
          mb: 1,
          background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.secondary[600]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Student Registration
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Complete your profile to get started with the mentoring platform
        </Typography>
      </Box>

      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {/* Enhanced stepper with better visual feedback */}
        <Box sx={{ 
          py: 3, 
          px: 3, 
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.neutral[200]}`
        }}>
          <Stepper 
            activeStep={currentStep - 1} 
            connector={<StyledStepConnector />}
          >
            <Step>
              <StyledStep>Basic Information</StyledStep>
            </Step>
            <Step>
              <StyledStep>Subjects & Preferences</StyledStep>
            </Step>
          </Stepper>
        </Box>
        
        {/* Form content with validation */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderLeft: `4px solid ${colors.warning[500]}` 
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Step 1 */}
          {currentStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary[500],
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary[700],
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                error={!!errors.rollNo}
                helperText={errors.rollNo}
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary[500],
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary[700],
                  }
                }}
              />
              
              <FormControl 
                fullWidth 
                required 
                error={!!errors.department}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary[500],
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary[700],
                  }
                }}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  label="Department"
                  variant="outlined"
                >
                  <MenuItem value=""><em>Select Department</em></MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Electrical Engineering">Electrical Engineering</MenuItem>
                  <MenuItem value="Mechanical Engineering">Mechanical Engineering</MenuItem>
                  <MenuItem value="Civil Engineering">Civil Engineering</MenuItem>
                  <MenuItem value="Chemical Engineering">Chemical Engineering</MenuItem>
                </Select>
                {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
              </FormControl>
              
              {/* Year Selection with enhanced styling */}
              <FormControl 
                fullWidth 
                required 
                error={!!errors.year}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary[500],
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary[700],
                  }
                }}
              >
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  label="Year"
                  variant="outlined"
                >
                  <MenuItem value=""><em>Select Year</em></MenuItem>
                  {YEARS.map(y => (
                    <MenuItem key={y} value={y}>{y} Year</MenuItem>
                  ))}
                </Select>
                {errors.year && <FormHelperText>{errors.year}</FormHelperText>}
              </FormControl>
              
              {/* Semester Selection with enhanced styling */}
              <FormControl 
                fullWidth 
                required 
                error={!!errors.semester}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary[500],
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: colors.primary[700],
                  }
                }}
              >
                <InputLabel>Semester</InputLabel>
                <Select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  label="Semester"
                  variant="outlined"
                >
                  <MenuItem value=""><em>Select Semester</em></MenuItem>
                  {SEMESTERS.map(sem => (
                    <MenuItem key={sem} value={sem}>{sem} Semester</MenuItem>
                  ))}
                </Select>
                {errors.semester && <FormHelperText>{errors.semester}</FormHelperText>}
              </FormControl>
              
              <Button
                variant="contained"
                onClick={nextStep}
                disabled={loading}
                sx={{ 
                  textTransform: 'none',
                  py: 1.5,
                  px: 4,
                  mt: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 2,
                  background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[700]})`,
                  borderRadius: 2,
                  '&:hover': {
                    background: `linear-gradient(to right, ${colors.primary[700]}, ${colors.primary[800]})`,
                    boxShadow: 3,
                  }
                }}
                endIcon={<ArrowForwardIcon />}
              >
                {loading ? 'Loading...' : 'Continue to Subject Selection'}
              </Button>
            </Box>
          )}
          
          {/* Step 2 - Subject Selection */}
          {currentStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: colors.neutral[800], mb: 1 }}>
                  Select Subjects for Mentoring
                </Typography>
                <Typography variant="body1" sx={{ color: colors.neutral[600], mb: 3 }}>
                  Choose the subjects you need assistance with. You can select multiple subjects.
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  mb: 3
                }}
              >
                {SUBJECTS.map(subject => (
                  <Box 
                    key={subject.id} 
                    onClick={() => handleSubjectToggle(subject.id)}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      border: '2px solid',
                      borderColor: selectedSubjects.includes(subject.id) ? colors.primary[500] : colors.neutral[200],
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      bgcolor: selectedSubjects.includes(subject.id) ? colors.primary[50] : 'transparent',
                      boxShadow: selectedSubjects.includes(subject.id) ? '0 2px 4px rgba(37, 99, 235, 0.1)' : 'none',
                      '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        borderColor: selectedSubjects.includes(subject.id) ? colors.primary[600] : colors.primary[300],
                        bgcolor: selectedSubjects.includes(subject.id) ? colors.primary[50] : colors.neutral[50],
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        fontSize: '1.75rem',
                        mr: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: selectedSubjects.includes(subject.id) ? colors.primary[100] : colors.neutral[100],
                      }}
                    >
                      {subject.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 500,
                          color: selectedSubjects.includes(subject.id) ? colors.primary[700] : colors.neutral[800],
                        }}
                      >
                        {subject.name}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: selectedSubjects.includes(subject.id) ? colors.primary[500] : colors.neutral[300],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedSubjects.includes(subject.id) ? colors.primary[500] : 'transparent',
                      transition: 'all 0.2s ease',
                    }}>
                      {selectedSubjects.includes(subject.id) && (
                        <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {selectedSubjects.length === 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 3,
                    borderLeft: `4px solid ${colors.warning[500]}` 
                  }}
                >
                  Please select at least one subject for mentoring
                </Alert>
              )}
              
              <Box
                sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  pt: 2
                }}
              >
                <Button 
                  variant="outlined" 
                  onClick={prevStep}
                  disabled={loading}
                  sx={{ 
                    textTransform: 'none',
                    borderColor: colors.neutral[300],
                    color: colors.neutral[700],
                    py: 1.5,
                    px: 4,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: colors.neutral[400],
                      bgcolor: colors.neutral[50]
                    }
                  }}
                >
                  Back to Basic Info
                </Button>
                
                <Button 
                  variant="contained" 
                  onClick={handleSubmit}
                  disabled={loading || selectedSubjects.length === 0}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                  sx={{ 
                    textTransform: 'none',
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                    background: `linear-gradient(to right, ${colors.success[500]}, ${colors.success[700]})`,
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 6px 8px -1px rgba(16, 185, 129, 0.3)',
                      background: `linear-gradient(to right, ${colors.success[600]}, ${colors.success[700]})`,
                    },
                    '&.Mui-disabled': {
                      background: colors.neutral[300]
                    }
                  }}
                >
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Help text */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
        sx={{ mt: 4, mb: 2 }}
      >
        Having trouble? Contact support at support@mentoringportal.com
      </Typography>
    </Box>
  );
}

export default StudentForm;