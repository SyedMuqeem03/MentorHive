import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Avatar, 
  Button, Chip, Paper, Divider, TextField, InputAdornment, IconButton, Tab, Tabs
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  ChatBubbleOutline as ChatIcon,
  Email as EmailIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon
} from '@mui/icons-material';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Update the color system and styling elements

// Update the colors object to emphasize violet and blue gradients
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
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
  }
};

// Mentor data from your SUBJECT_TO_MENTOR_MAP
const SUBJECT_TO_MENTOR_MAP = {
  'Syo20eOFoyLVGfJu6opHYoVoRFy1': { 
    id: 'Syo20eOFoyLVGfJu6opHYoVoRFy1', 
    name: 'Machine Learning Mentor', 
    email: 'machine@gmail.com',
    department: 'Computer Science',
    expertise: 'Machine Learning',
    subjects: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
    bio: 'Expert in machine learning algorithms and neural networks with 5 years of teaching experience.',
    availability: ['Monday 2-4 PM', 'Thursday 10-12 AM'],
    rating: 4.8
  },
  'NtFHYdkiduZsUcAXtmTbvHYIka53': { 
    id: 'NtFHYdkiduZsUcAXtmTbvHYIka53', 
    name: 'Environmental Science Mentor', 
    email: 'teacher@gmail.com',
    department: 'Environmental Sciences',
    expertise: 'Environmental Science',
    subjects: ['Environmental Science', 'Ecology', 'Climate Studies'],
    bio: 'Environmental scientist specializing in sustainable development and climate change research.',
    availability: ['Tuesday 1-3 PM', 'Friday 10-12 AM'],
    rating: 4.7
  },
  '7OHzrzbo0FZYSpiMAAz9J5f3fCM2': { 
    id: '7OHzrzbo0FZYSpiMAAz9J5f3fCM2', 
    name: 'Scripting Languages Mentor', 
    email: 'Script@gmail.com',
    department: 'Computer Science',
    expertise: 'Scripting Languages',
    subjects: ['Python', 'JavaScript', 'Shell Scripting'],
    bio: 'Programming language expert with focus on scripting languages and automation.',
    availability: ['Wednesday 2-4 PM', 'Friday 3-5 PM'],
    rating: 4.9
  },
  'j1rXcFroIPdKcPO6MVpbqW0xebk1': { 
    id: 'j1rXcFroIPdKcPO6MVpbqW0xebk1', 
    name: 'Formal Languages Mentor', 
    email: 'Flat@gmail.com',
    department: 'Computer Science',
    expertise: 'Theory of Computation',
    subjects: ['Formal Languages', 'Automata Theory', 'Compiler Design'],
    bio: 'Specialized in formal languages, automata theory, and computational complexity.',
    availability: ['Monday 10-12 AM', 'Thursday 1-3 PM'],
    rating: 4.6
  },
  'mZvqjUvNAUZlWxq8dlGx446wa5i1': { 
    id: 'mZvqjUvNAUZlWxq8dlGx446wa5i1', 
    name: 'Artificial Intelligence Mentor', 
    email: 'Artificial@gmail.com',
    department: 'Computer Science',
    expertise: 'Artificial Intelligence',
    subjects: ['AI', 'Machine Learning', 'Computer Vision'],
    bio: 'AI researcher with focus on natural language processing and computer vision applications.',
    availability: ['Tuesday 3-5 PM', 'Wednesday 10-12 AM'],
    rating: 4.9
  },
  'dot6tsUEEBaxgRZwRX2LTx7wIj62': { 
    id: 'dot6tsUEEBaxgRZwRX2LTx7wIj62', 
    name: 'IOMP Mentor', 
    email: 'iopm@gmail.com',
    department: 'Engineering',
    expertise: 'Industrial Operations',
    subjects: ['IOMP', 'Operations Research', 'Supply Chain Management'],
    bio: 'Expert in industrial operations and management processes with industry experience.',
    availability: ['Monday 3-5 PM', 'Friday 1-3 PM'],
    rating: 4.5
  },
  'uXhkGWF2I6OffMY1d9xknFpdJxp1': { 
    id: 'uXhkGWF2I6OffMY1d9xknFpdJxp1', 
    name: 'IoT Mentor', 
    email: 'teacher@gmail.com',
    department: 'Information Technology',
    expertise: 'Internet of Things',
    subjects: ['IoT', 'Embedded Systems', 'Sensor Networks'],
    bio: 'IoT specialist with experience in embedded systems and sensor networks.',
    availability: ['Tuesday 10-12 AM', 'Thursday 3-5 PM'],
    rating: 4.7
  }
};

// All departments for filtering
const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Environmental Sciences',
  'Engineering',
  'Information Technology',
];

function MyMentorsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [myMentors, setMyMentors] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [allMentors, setAllMentors] = useState([]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All Departments');
  };
  
  // Fetch student data and mentors
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Get student data
        const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));
        
        if (!studentDoc.exists()) {
          setError('No student profile found. Please complete your profile.');
          setLoading(false);
          return;
        }
        
        const data = studentDoc.data();
        setStudentData(data);
        
        // Prepare all mentors for Find Mentors section
        const allAvailableMentors = Object.values(SUBJECT_TO_MENTOR_MAP).map(mentor => ({
          ...mentor,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random&color=fff`
        }));
        setAllMentors(allAvailableMentors);
        
        // Map real mentors based on the subject IDs from student data
        if (data.subjects && data.subjects.length > 0) {
          console.log("Student subjects:", data.subjects);
          
          const mappedMentors = data.subjects
            .map(subject => {
              const subjectId = String(subject.id).trim();
              
              // First try direct mapping with the subject ID
              let mentorInfo = SUBJECT_TO_MENTOR_MAP[subjectId];
              
              if (!mentorInfo) {
                console.log(`No direct mentor match for subject: ${subject.name} (${subjectId})`);
                
                // Try to find a mentor whose expertise matches this subject name
                const subjectLower = subject.name.toLowerCase();
                mentorInfo = Object.values(SUBJECT_TO_MENTOR_MAP).find(m => 
                  m.expertise.toLowerCase().includes(subjectLower) || 
                  (m.subjects && m.subjects.some(s => s.toLowerCase() === subjectLower))
                );
                
                if (mentorInfo) {
                  console.log(`Found mentor by expertise match: ${mentorInfo.name}`);
                }
              }
              
              if (!mentorInfo) {
                console.log(`No mentor found for subject: ${subject.name}, using fallback`);
                return null;
              }
              
              // Create a consistent mentor object that matches the subject
              return {
                ...mentorInfo,
                subject: subject.name,
                subjectId: subjectId,
                // Make sure department is consistent with the subject
                department: getSubjectDepartment(subject.name, mentorInfo.department),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorInfo.name)}&background=random&color=fff`,
              };
            })
            .filter(Boolean);
            
          setMyMentors(mappedMentors);
          
          // If no mentors matched, create appropriate fallbacks
          if (mappedMentors.length === 0 && data.subjects.length > 0) {
            console.log("No mentors matched, creating subject-appropriate fallbacks");
            
            const fallbackMentors = data.subjects.map(subject => {
              // Find the most appropriate mentor for this subject
              const subjectLower = subject.name.toLowerCase();
              
              // Try to find the best mentor match by subject keywords
              const mentorMatch = findBestMentorForSubject(subject.name);
              
              return {
                ...mentorMatch,
                subject: subject.name,
                subjectId: subject.id,
                department: getSubjectDepartment(subject.name, mentorMatch.department),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorMatch.name)}&background=random&color=fff`,
              };
            });
            
            setMyMentors(fallbackMentors);
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [currentUser, navigate]);

  // Start chat with mentor
  const handleStartChat = (mentor) => {
    if (!mentor.id) {
      console.error("Missing mentor ID for chat!", mentor);
      return;
    }
    
    navigate(`/chat/${mentor.id}`);
  };
  
  // Schedule session with mentor
  const handleScheduleSession = (mentor) => {
    // This would typically open a scheduling dialog or redirect to a scheduling page
    console.log(`Scheduling session with ${mentor.name} for ${mentor.subject || mentor.expertise}`);
    // For now, just show an alert
    alert(`Feature coming soon: Schedule a session with ${mentor.name}`);
  };

  // Get initials for the avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Filter mentors for the Find Mentors tab
  const filteredMentors = allMentors.filter(mentor => {
    const isInMyMentors = myMentors.some(m => m.id === mentor.id);
    
    // Skip mentors that are already assigned to the student
    if (isInMyMentors) {
      return false;
    }
    
    const matchesSearch = searchQuery === '' || 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentor.subjects && mentor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
      
    const matchesDepartment = departmentFilter === 'All Departments' || 
      mentor.department === departmentFilter;
      
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return <LoadingSpinner center text="Loading mentors..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Mentors
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          mt: 7, // Added margin-top of 48px (equivalent to 6 in MUI spacing)
          borderRadius: 3,
          background: 'linear-gradient(120deg, #4338ca 0%, #6d28d9 50%, #8b5cf6 100%)', // Rich violet-blue gradient
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(99, 102,241, 0.2)',
        }}
      >
        {/* Add decorative geometric shapes in the background */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Content container - positions text above the background patterns */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box display="flex" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  textShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  background: 'linear-gradient(90deg, #ffffff 0%, #e0e7ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Academic Mentors
              </Typography>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  opacity: 0.9,
                  maxWidth: '600px',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Connect with expert mentors in your field of study to enhance your academic journey and get personalized guidance.
              </Typography>
            </Box>
            
            <Button 
              variant="contained"
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/student-home')}
              sx={{ 
                mt: { xs: 3, sm: 0 },
                bgcolor: 'rgba(255,255,255,0.15)', 
                backdropFilter: 'blur(4px)',
                color: 'white',
                fontWeight: 500,
                borderRadius: 2,
                px: 2,
                py: 1,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                },
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Back to Dashboard
            </Button>
          </Box>

          {/* Optional: Add mentor stats */}
          <Box 
            sx={{ 
              mt: 6, // Changed from mt: 12 to mt: 6 for better positioning
              display: 'flex',
              gap: { xs: 2, md: 4 },
              flexWrap: 'wrap'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.1)',
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}>
              <PersonIcon sx={{ fontSize: 20, mr: 1, opacity: 0.8 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {myMentors.length} Assigned Mentors
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.1)',
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}>
              <SchoolIcon sx={{ fontSize: 20, mr: 1, opacity: 0.8 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {filteredMentors.length} Available Mentors
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tab Navigation */}
      <Tabs 
        value={activeTab}
        onChange={handleTabChange}
        sx={{ 
          mb: 4,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            px: 4
          }
        }}
      >
        <Tab label="My Mentors" />
        <Tab label="Find Mentors" />
      </Tabs>

      {/* My Mentors Tab */}
      {activeTab === 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Your Assigned Mentors
          </Typography>
          
          {myMentors.length > 0 ? (
            <Grid container spacing={2}>
              {myMentors.map((mentor) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={mentor.id}>
                  <Card 
                    sx={{ 
                      borderRadius: 2, 
                      boxShadow: '0 3px 8px rgba(99, 102,241, 0.12)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        alignItems: 'center',
                        borderBottom: 1, 
                        borderColor: 'divider',
                        background: colors.indigo[50],
                      }}
                    >
                      <Avatar
                        src={mentor.avatar}
                        alt={mentor.name}
                        sx={{ width: 40, height: 40, mr: 1.5 }}
                      >
                        {getInitials(mentor.name)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {mentor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mentor.expertise} Expert
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: colors.warning[500]
                      }}>
                        <StarIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>
                          {mentor.rating || '4.5'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Subject
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {mentor.subject}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body2">
                          {mentor.department || 'Faculty'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {mentor.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Available
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {(mentor.availability || ['Monday 2-4 PM', 'Thursday 10-12 AM']).map((time, index) => (
                            <Chip
                              key={index}
                              label={time}
                              size="small"
                              sx={{
                                bgcolor: colors.violet[50],
                                color: colors.violet[700],
                                fontSize: '0.675rem',
                                height: '20px'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              onClick={() => handleScheduleSession(mentor)}
                              sx={{
                                bgcolor: colors.indigo[600],
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 500,
                                py: 0.5,
                                '&:hover': {
                                  bgcolor: colors.indigo[700]
                                }
                              }}
                            >
                              Schedule
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              onClick={() => handleStartChat(mentor)}
                              sx={{
                                borderColor: colors.violet[300],
                                color: colors.violet[700],
                                textTransform: 'none',
                                fontWeight: 500,
                                py: 0.5,
                                '&:hover': {
                                  bgcolor: colors.violet[50],
                                  borderColor: colors.violet[400]
                                }
                              }}
                            >
                              Message
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ 
              p: 4, 
              borderRadius: 2, 
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            }}>
              <Box sx={{ mb: 2, color: colors.neutral[400] }}>
                <PersonIcon sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No mentors assigned yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                You don't have any mentors assigned to your subjects.
              </Typography>
              <Button 
                variant="contained"
                onClick={() => setActiveTab(1)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3
                }}
              >
                Find Mentors
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Find Mentors Tab */}
      {activeTab === 1 && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Find Other Available Mentors
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={8} md={9}>
                <TextField
                  fullWidth
                  placeholder="Search by name, expertise or subject..."
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  SelectProps={{
                    native: true
                  }}
                  variant="outlined"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterAltIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredMentors.length} of {allMentors.length - myMentors.length} available mentors
                </Typography>
              </Box>
              
              {(searchQuery || departmentFilter !== 'All Departments') && (
                <Button 
                  variant="text" 
                  color="primary"
                  startIcon={<ClearIcon />}
                  size="small"
                  onClick={handleClearFilters}
                  sx={{
                    color: colors.indigo[600],
                    '&:hover': {
                      bgcolor: colors.indigo[50]
                    }
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </Box>
          
          {filteredMentors.length > 0 ? (
            <Grid container spacing={3}>
              {filteredMentors.map((mentor) => (
                <Grid item xs={12} sm={6} lg={4} key={mentor.id}>
                  <Card 
                    sx={{ 
                      borderRadius: 2, 
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px rgba(99, 102, 241, 0.25)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        borderBottom: 1, 
                        borderColor: 'divider',
                        background: colors.indigo[50],
                      }}
                    >
                      <Avatar
                        src={mentor.avatar}
                        alt={mentor.name}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {getInitials(mentor.name)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {mentor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mentor.expertise} Expert
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: colors.warning[500]
                      }}>
                        <StarIcon fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                          {mentor.rating || '4.5'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {mentor.department || 'Faculty'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Subjects
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {(mentor.subjects || [mentor.expertise]).map((subject, idx) => (
                            <Chip
                              key={idx}
                              label={subject}
                              size="small"
                              sx={{
                                bgcolor: colors.indigo[50],
                                color: colors.indigo[700],
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      {mentor.bio && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Bio
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            mt: 0.5, 
                            color: colors.neutral[700],
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {mentor.bio}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Available
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          {(mentor.availability || ['Monday 2-4 PM', 'Thursday 10-12 AM']).slice(0, 2).map((time, index) => (
                            <Chip
                              key={index}
                              label={time}
                              size="small"
                              sx={{
                                bgcolor: colors.violet[50],
                                color: colors.violet[700],
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleStartChat(mentor)}
                          startIcon={<ChatIcon />}
                          sx={{
                            bgcolor: colors.indigo[600],
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              bgcolor: colors.indigo[700]
                            }
                          }}
                        >
                          Message Mentor
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2, 
                bgcolor: colors.neutral[50],
                border: `1px dashed ${colors.neutral[300]}` 
              }}
            >
              <SearchIcon sx={{ fontSize: 60, color: colors.neutral[400], mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No mentors found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search filters to find more mentors
              </Typography>
              <Button 
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear All Filters
              </Button>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}

// Helper function to find the best mentor for a subject
function findBestMentorForSubject(subjectName) {
  const subjectLower = subjectName.toLowerCase();
  
  // Define subject keywords and corresponding mentor IDs
  const subjectKeywords = {
    'machine learning': 'Syo20eOFoyLVGfJu6opHYoVoRFy1',
    'artificial intelligence': 'mZvqjUvNAUZlWxq8dlGx446wa5i1',
    'environmental': 'NtFHYdkiduZsUcAXtmTbvHYIka53',
    'scripting': '7OHzrzbo0FZYSpiMAAz9J5f3fCM2',
    'formal language': 'j1rXcFroIPdKcPO6MVpbqW0xebk1',
    'automata': 'j1rXcFroIPdKcPO6MVpbqW0xebk1',
    'iomp': 'dot6tsUEEBaxgRZwRX2LTx7wIj62',
    'iot': 'uXhkGWF2I6OffMY1d9xknFpdJxp1',
    'internet of things': 'uXhkGWF2I6OffMY1d9xknFpdJxp1',
  };
  
  // Find matching keyword
  for (const [keyword, mentorId] of Object.entries(subjectKeywords)) {
    if (subjectLower.includes(keyword)) {
      return SUBJECT_TO_MENTOR_MAP[mentorId];
    }
  }
  
  // Default fallback - return a random mentor
  const mentorIds = Object.keys(SUBJECT_TO_MENTOR_MAP);
  const randomMentorId = mentorIds[Math.floor(Math.random() * mentorIds.length)];
  return SUBJECT_TO_MENTOR_MAP[randomMentorId];
}

// Helper function to determine the appropriate department for a subject
function getSubjectDepartment(subjectName, defaultDepartment) {
  const subjectLower = subjectName.toLowerCase();
  
  if (subjectLower.includes('machine learning') || 
      subjectLower.includes('artificial intelligence') || 
      subjectLower.includes('programming') ||
      subjectLower.includes('scripting') ||
      subjectLower.includes('formal language') ||
      subjectLower.includes('automata')) {
    return 'Computer Science';
  }
  
  if (subjectLower.includes('environmental') || 
      subjectLower.includes('ecology') ||
      subjectLower.includes('climate')) {
    return 'Environmental Sciences';
  }
  
  if (subjectLower.includes('iot') || 
      subjectLower.includes('internet of things') ||
      subjectLower.includes('embedded')) {
    return 'Information Technology';
  }
  
  if (subjectLower.includes('iomp') || 
      subjectLower.includes('operations') ||
      subjectLower.includes('industrial')) {
    return 'Engineering';
  }
  
  return defaultDepartment || 'Academic Faculty';
}

export default MyMentorsPage;