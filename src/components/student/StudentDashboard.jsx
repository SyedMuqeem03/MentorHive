import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, Typography, Grid, Avatar, Button, Chip, Tabs, Tab, Box, Paper } from '@mui/material';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Star as StarIcon, CalendarToday as CalendarIcon, ChatBubbleOutline as ChatIcon } from '@mui/icons-material';

// Import the AIIcon component
import { SmartToy as AIIcon } from '@mui/icons-material';

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

const safeColorParse = (color) => {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return '0,0,0'; // Default to black if color is invalid
  }
  
  try {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `${r},${g},${b}`;
  } catch (e) {
    console.warn('Error parsing color:', e);
    return '0,0,0'; // Fallback to black
  }
};

// Add this mapping at the top of your file, after the colors object
const SUBJECT_TO_MENTOR_MAP = {
  // Subject ID to mentor ID mapping
  'Syo20eOFoyLVGfJu6opHYoVoRFy1': { 
    id: 'Syo20eOFoyLVGfJu6opHYoVoRFy1', 
    name: 'Machine Learning Mentor', 
    email: 'machine@gmail.com'
  },
  'NtFHYdkiduZsUcAXtmTbvHYIka53': { 
    id: 'NtFHYdkiduZsUcAXtmTbvHYIka53', 
    name: 'Environmental Science Mentor', 
    email: 'teacher@gmail.com'
  },
  '7OHzrzbo0FZYSpiMAAz9J5f3fCM2': { 
    id: '7OHzrzbo0FZYSpiMAAz9J5f3fCM2', 
    name: 'Scripting Languages Mentor', 
    email: 'Script@gmail.com'
  },
  'j1rXcFroIPdKcPO6MVpbqW0xebk1': { 
    id: 'j1rXcFroIPdKcPO6MVpbqW0xebk1', 
    name: 'Formal Languages Mentor', 
    email: 'Flat@gmail.com'
  },
  'mZvqjUvNAUZlWxq8dlGx446wa5i1': { 
    id: 'mZvqjUvNAUZlWxq8dlGx446wa5i1', 
    name: 'Artificial Intelligence Mentor', 
    email: 'Artificial@gmail.com'
  },
  'dot6tsUEEBaxgRZwRX2LTx7wIj62': { 
    id: 'dot6tsUEEBaxgRZwRX2LTx7wIj62', 
    name: 'IOMP Mentor', 
    email: 'iopm@gmail.com'
  },
  'uXhkGWF2I6OffMY1d9xknFpdJxp1': { 
    id: 'uXhkGWF2I6OffMY1d9xknFpdJxp1', 
    name: 'IoT Mentor', 
    email: 'teacher@gmail.com'
  }
};

function StudentDashboard({ studentData }) {
  const { currentUser } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // In a real app, this would fetch the assigned mentors from an API
  useEffect(() => {
    if (!studentData || !studentData.subjects) {
      console.log("Missing student data or subjects");
      return;
    }
    
    // Map real mentors based on the subject IDs
    const realMentors = studentData.subjects.map(subject => {
      // Ensure subject.id is treated as a string and remove any whitespace
      const subjectId = String(subject.id).trim();
      
      // Find mentor for this subject - use the EXACT subject ID as key
      const mentorInfo = SUBJECT_TO_MENTOR_MAP[subjectId];
      
      // Debug info
      console.log(`Subject ${subject.name} (${subjectId}): ${mentorInfo ? 'Mentor found' : 'No mentor mapping'}`);
      
      // If no mentor info found, try to find a mentor for this subject by name
      let mentorData;
      if (!mentorInfo) {
        // Try to match by subject name
        const subjectLower = subject.name.toLowerCase();
        const matchingMentor = Object.values(SUBJECT_TO_MENTOR_MAP).find(m => 
          m.name.toLowerCase().includes(subjectLower) || 
          subjectLower.includes(m.name.toLowerCase().replace(' mentor', ''))
        );
        
        if (matchingMentor) {
          console.log(`Found mentor by name match for ${subject.name}: ${matchingMentor.name}`);
          mentorData = matchingMentor;
        } else {
          console.warn(`No mentor mapping found for subject: ${subject.name} (${subjectId})`);
          mentorData = {
            id: subjectId,
            name: `${subject.name} Mentor`,
            email: `mentor.${subject.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`
          };
        }
      } else {
        mentorData = mentorInfo;
      }
      
      // Store the real mentor in Firestore if they don't exist
      const ensureMentorExists = async () => {
        try {
          if (!mentorData.id) {
            console.warn("Missing mentor ID for subject:", subject);
            return;
          }
          
          const mentorRef = doc(db, 'mentors', mentorData.id);
          const mentorSnap = await getDoc(mentorRef);
          
          if (!mentorSnap.exists()) {
            await setDoc(mentorRef, {
              name: mentorData.name,
              email: mentorData.email,
              subject: subject.name,
              role: 'mentor',
              department: 'Academic Faculty',
              hasCompletedProfile: true
            });
            console.log(`Created mentor for ${subject.name} with ID: ${mentorData.id}`);
          }
        } catch (err) {
          console.error("Error ensuring mentor exists:", err);
        }
      };
      
      // Call the function but don't wait for it
      ensureMentorExists().catch(err => {
        console.error(`Failed to ensure mentor exists for ${subject.name}:`, err);
      });
      
      // Return formatted mentor data with proper ID references
      return {
        id: mentorData.id,
        name: mentorData.name,
        subject: subject.name,
        email: mentorData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorData.name)}&background=random&color=fff`,
        availability: ['Monday 2-4 PM', 'Thursday 10-12 AM'],
        rating: (4 + Math.random()).toFixed(1),
        expertise: subject.name,
        subjectId: subjectId,
        mentorId: mentorData.id  // Add explicit mentorId field for clarity
      };
    });
    
    setMentors(realMentors);
  }, [studentData]);

  // Check that you're using the correct subject IDs in your data - debug
  useEffect(() => {
    console.group("Subject IDs in StudentDashboard");
    console.log("Student subjects:", studentData?.subjects?.map(s => ({ id: s.id, name: s.name })));
    console.log("All mentors:", mentors);
    console.groupEnd();
  }, [studentData, mentors]);

  // Get the first letter of the student's name for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Fix the handleStartChat function to ensure it uses proper subject IDs that exist in the mapping
  const handleStartChat = (mentor) => {
    if (!mentor.subjectId) {
      console.error("Missing subject ID for chat!", mentor);
      return;
    }
    
    // First, try using the mentor.id directly if it's a valid Firebase ID
    if (mentor.id && mentor.id.length > 10) {
      console.log(`Using direct mentor ID for chat: ${mentor.id}`);
      navigate(`/chat/${mentor.id}`);
      return;
    }
    
    // Otherwise, try to use the subject mapping
    const subjectId = String(mentor.subjectId);
    
    // Check if we have a direct mapping for this subject ID
    if (SUBJECT_TO_MENTOR_MAP[subjectId]) {
      const mentorId = SUBJECT_TO_MENTOR_MAP[subjectId].id;
      console.log(`Using mapped mentor ID ${mentorId} for subject ${subjectId}`);
      navigate(`/chat/${mentorId}`);
      return;
    }
    
    // If no direct mapping exists, try to find the mentor by name or email match
    const matchingMentor = Object.values(SUBJECT_TO_MENTOR_MAP).find(m => 
      m.name === mentor.name || m.email === mentor.email
    );
    
    if (matchingMentor) {
      console.log(`Found matching mentor by name/email: ${matchingMentor.id}`);
      navigate(`/chat/${matchingMentor.id}`);
      return;
    }
    
    // Last resort - log error and use subject ID anyway
    console.error(`No mentor mapping found for subject ID: ${subjectId}`);
    navigate(`/chat/${subjectId}`);
  };

  if (!studentData) {
    return <LoadingSpinner center text="Loading your dashboard..." />;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Student Profile Summary */}
      <div 
        className="rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        style={{ 
          background: `linear-gradient(to right, ${colors.primary[700]}, ${colors.secondary[600]})`,
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
        }}
      >
        {/* Profile header with avatar, name and key details */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'white',
                color: colors.primary[700],
                fontWeight: 'bold',
                fontSize: '1.5rem',
                mr: 2
              }}
            >
              {getInitials(studentData.name)}
            </Avatar>
            <div>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white' }}>
                {studentData.name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {studentData.rollNo} • {studentData.department}
              </Typography>
            </div>
          </div>
          
          {/* Enhance the mentoring subjects counter */}
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            backdropFilter: 'blur(10px)',
            padding: '12px 16px', 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Mentoring Subjects
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {studentData.subjects.length}
            </Typography>
          </div>
        </div>
        
        {/* Tab Navigation - Removed Sessions Tab */}
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          className="mt-8"
          sx={{
            '& .MuiTab-root': { 
              textTransform: 'none',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              minWidth: 'auto',
              mr: 2,
              px: 2,
              borderRadius: '8px 8px 0 0',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            },
            '& .Mui-selected': { 
              color: `${colors.primary[800]} !important`,
              fontWeight: 600,
              backgroundColor: 'white',
            },
            '& .MuiTabs-indicator': { 
              display: 'none'
            }
          }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="My Mentors" value="mentors" />
        </Tabs>
      </div>
      
      {/* Main content */}
      <div className="p-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats with enhanced styling */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  border: `2px solid ${colors.primary[100]}`,
                  background: `linear-gradient(145deg, white, ${colors.primary[50]})`,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: `linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]})`
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.primary[700], mb: 1 }}>
                      Total Mentors
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: colors.primary[800] }}>
                        {mentors.length}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
                          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                          ml: 'auto'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="white">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: colors.neutral[500] }}>
                      Assigned to your subjects
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  border: `2px solid ${colors.secondary[100]}`,
                  background: `linear-gradient(145deg, white, ${colors.secondary[50]})`,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: `linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]})`
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.secondary[600], mb: 1 }}>
                      Upcoming Sessions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: colors.neutral[800] }}>
                        0
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${colors.secondary[500]}, ${colors.secondary[600]})`,
                          boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)',
                          ml: 'auto'
                        }}
                      >
                        <CalendarIcon sx={{ color: 'white' }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: colors.neutral[500] }}>
                      No sessions scheduled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Student Information with enhanced shadow */}
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -1px rgba(0,0,0,0.05)`,
              border: `2px solid ${colors.primary[100]}`,
              position: 'relative',
              overflow: 'visible',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 15px 30px -5px rgba(${safeColorParse(colors.primary[200])}, 0.4), 0 10px 10px -5px rgba(0,0,0,0.04)`
              }
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: 20,
                  bgcolor: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  border: `2px solid ${colors.primary[100]}`,
                  color: colors.primary[700],
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                }}
              >
                Student Information
              </Box>
              <CardContent sx={{ p: 3, pt: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ width: 120, color: colors.neutral[500] }}>
                        Name
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {studentData.name}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ width: 120, color: colors.neutral[500] }}>
                        Roll Number
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {studentData.rollNo}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ width: 120, color: colors.neutral[500] }}>
                        Department
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {studentData.department}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ width: 120, color: colors.neutral[500] }}>
                        Email
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {currentUser.email}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ width: 120, color: colors.neutral[500] }}>
                        Year
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {studentData.year || "Not specified"}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Typography sx={{ width: 120, color: colors.neutral[500] }}>
                        Semester
                      </Typography>
                      <Typography sx={{ fontWeight: 500 }}>
                        {studentData.semester || "Not specified"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Subjects with enhanced shadow */}
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -1px rgba(0,0,0,0.05)`,
              border: `2px solid ${colors.secondary[100]}`,
              position: 'relative',
              overflow: 'visible',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 15px 30px -5px rgba(${safeColorParse(colors.secondary[200])}, 0.4), 0 10px 10px -5px rgba(0,0,0,0.04)`
              }
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: 20,
                  bgcolor: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  border: `2px solid ${colors.secondary[100]}`,
                  color: colors.secondary[600],
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                }}
              >
                Subjects for Mentoring
              </Box>
              <CardContent sx={{ p: 3, pt: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5
                }}>
                  {studentData.subjects.map(subject => (
                    <Chip
                      key={subject.id}
                      icon={
                        <span style={{ fontSize: '1.1rem', marginRight: '4px' }}>
                          {subject.icon}
                        </span>
                      }
                      label={subject.name}
                      sx={{
                        bgcolor: colors.secondary[50],
                        color: colors.secondary[600],
                        fontWeight: 500,
                        py: 2.5,
                        border: `1px solid ${colors.secondary[100]}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        '&:hover': {
                          bgcolor: colors.secondary[100],
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeTab === 'mentors' && (
          <div>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              My Mentors
            </Typography>
            
            {/* Mentors Section - Now links to dedicated page */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    My Mentors
                  </Typography>
                  
                  {mentors.length > 0 ? (
                    <>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        You have {mentors.length} mentors assigned to your subjects. View detailed information and connect with them on the mentors page.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {mentors.slice(0, 2).map((mentor) => (
                          <Chip
                            key={mentor.id}
                            avatar={
                              <Avatar 
                                alt={mentor.name}
                                src={mentor.avatar}
                              >
                                {getInitials(mentor.name)}
                              </Avatar>
                            }
                            label={mentor.name}
                            sx={{ mb: 1 }}
                          />
                        ))}
                        {mentors.length > 2 && (
                          <Chip
                            label={`+${mentors.length - 2} more`}
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No mentors assigned yet. Please check back after selecting your subjects.
                    </Typography>
                  )}
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/mentors')}
                  sx={{ 
                    mt: 2,
                    alignSelf: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View All Mentors
                </Button>
              </Paper>
            </Grid>
          </div>
        )}
        
        {/* AI Mentor Assistant Container - Centered and Enhanced */}
        {/* <Box 
          sx={{ 
            mt: 6, 
            mb: 4,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '600px',
            mx: 'auto',
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #f5f3ff, #ede9fe)',
            border: `1px solid ${colors.secondary[100]}`,
            boxShadow: '0 8px 16px rgba(124, 58, 237, 0.1)'
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: colors.secondary[700] }}>
            AI Mentor Assistant
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: colors.neutral[600] }}>
            Get instant help with your studies, homework, and academic questions from our AI Mentor.
          </Typography>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AIIcon />}
            onClick={() => navigate('/ai-mentor')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(124, 58, 237, 0.4)',
              }
            }}
          >
            Ask AI Mentor
          </Button>
        </Box> */}
      </div>
    </div>
  );
}

export default StudentDashboard;