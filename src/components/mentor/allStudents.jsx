import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, Typography, Grid, Card, CardContent, Box, TextField, 
  MenuItem, Button, Avatar, Chip, Divider, Paper, IconButton,
  Tabs, Tab, InputAdornment, Tooltip, Fade, useTheme, CardActions,
  Badge, CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  ArrowBack as ArrowBackIcon,
  Message as MessageIcon,
  Sort as SortIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Subject as SubjectIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

function AllStudents() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();
  const theme = useTheme();

  // Define departments for filtering
  const DEPARTMENTS = [
    'All Departments',
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology'
  ];

  // Define subjects for filtering with icons
  const SUBJECTS = [
    { name: '', label: 'All Subjects', icon: '🔍' },
    { name: 'Machine Learning', label: 'Machine Learning', icon: '🤖' },
    { name: 'Artificial Intelligence', label: 'Artificial Intelligence', icon: '🧠' },
    { name: 'Formal Languages and Automata Theory', label: 'Formal Languages', icon: '📝' },
    { name: 'Scripting Languages', label: 'Scripting Languages', icon: '💻' },
    { name: 'Fundamentals of Internet of Things', label: 'IoT', icon: '📱' },
    { name: 'Environmental Science', label: 'Environmental Science', icon: '🌿' },
    { name: 'IOMP', label: 'IOMP', icon: '📊' }
  ];

  // Generate random avatar colors
  const stringToColor = (string) => {
    if (!string) return theme.palette.primary.main;
    
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  // Generate gradient based on string
  const stringToGradient = (string) => {
    if (!string) return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    
    const hash = string.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const h1 = Math.abs(hash % 360);
    const h2 = Math.abs((hash * 137) % 360);
    
    return `linear-gradient(135deg, hsl(${h1}, 70%, 60%) 0%, hsl(${h2}, 80%, 50%) 100%)`;
  };

  // Fetch students when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        const studentsQuery = query(
          collection(db, 'students'),
          where('hasCompletedProfile', '==', true)
        );
        
        const querySnapshot = await getDocs(studentsQuery);
        const studentsData = [];
        
        querySnapshot.forEach((doc) => {
          studentsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log("Fetched students:", studentsData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser?.uid) {
      fetchStudents();
    }
  }, [currentUser]);

  // Filter students based on search query and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' || 
      (student.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.department?.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesDepartment = departmentFilter === 'All Departments' || 
      student.department === departmentFilter;
      
    const matchesSubject = subjectFilter === '' ||
      student.subjects?.some(subject => subject.name === subjectFilter);
    
    // Filter by tab selection
    if (tabValue === 1) { // Recent
      // Filter logic for recent students (example: joined in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const studentDate = student.createdAt?.toDate() || new Date();
      return matchesSearch && matchesDepartment && matchesSubject && studentDate >= thirtyDaysAgo;
    }
      
    return matchesSearch && matchesDepartment && matchesSubject;
  });

  // Sort filtered students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'department') {
      return (a.department || '').localeCompare(b.department || '');
    } else if (sortBy === 'recent') {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA; // Newest first
    }
    return 0;
  });

  // Handle filter clearing
  const handleClearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All Departments');
    setSubjectFilter('');
  };

  // Navigate to chat with specific student
  const handleChatWithStudent = (studentId, event) => {
    event.stopPropagation();
    navigate(`/chat/${studentId}`);
  };

  // Navigate to student profile
  const handleViewStudentProfile = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      {/* Header with animated gradient background */}
      <Box 
        sx={{ 
          borderRadius: 2,
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            opacity: 0.2,
          }
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ 
            mb: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          Back
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Students Directory
            </Typography>
            <Typography variant="subtitle1">
              Browse and connect with {students.length} students
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            bgcolor: 'rgba(255,255,255,0.15)', 
            borderRadius: 2,
            p: 1
          }}>
            <Badge 
              badgeContent={students.filter(s => s.department === 'Computer Science').length} 
              color="warning"
              max={99}
            >
              <Tooltip title="Computer Science Students">
                <Chip 
                  icon={<SchoolIcon />} 
                  label="CS" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Tooltip>
            </Badge>
            
            <Badge 
              badgeContent={students.filter(s => s.department === 'Electrical Engineering').length} 
              color="warning"
              max={99}
            >
              <Tooltip title="Electrical Engineering Students">
                <Chip 
                  icon={<SchoolIcon />} 
                  label="EE" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Tooltip>
            </Badge>
            
            <Badge 
              badgeContent={students.filter(s => s.department === 'Information Technology').length} 
              color="warning"
              max={99}
            >
              <Tooltip title="IT Students">
                <Chip 
                  icon={<SchoolIcon />} 
                  label="IT" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Tooltip>
            </Badge>
          </Box>
        </Box>
      </Box>

      {/* Tabs and Filters */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2
            }
          }}
        >
          <Tab 
            icon={<PeopleIcon />} 
            iconPosition="start"
            label="All Students" 
          />
          <Tab 
            icon={<SchoolIcon />}
            iconPosition="start" 
            label="Recently Added" 
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Search students"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'action.active' }} />
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
                placeholder="Search by name, roll number or department..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  )
                }}
              >
                {DEPARTMENTS.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubjectIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  )
                }}
              >
                {SUBJECTS.map((subject, index) => (
                  <MenuItem key={index} value={subject.name}>
                    <span style={{ marginRight: '8px' }}>{subject.icon}</span>
                    {subject.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(searchQuery || departmentFilter !== 'All Departments' || subjectFilter !== '') && (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Showing {sortedStudents.length} of {students.length} students
              </Typography>
            </Box>
            
            <TextField
              select
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ width: 180 }}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="recent">Recently Added</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Paper>

      {/* Students Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading students...
          </Typography>
        </Box>
      ) : sortedStudents.length > 0 ? (
        <Grid 
          container 
          spacing={3} 
          alignItems="stretch" 
          sx={{ 
            mt: 1,
            '& .MuiGrid-item': {
              display: 'flex'
            }
          }}
        >
          {sortedStudents.map((student) => {
            const cardGradient = stringToGradient(student.name);
            
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={student.id}
              >
                <Card 
                  elevation={2} 
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '100%', // Full height
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => handleViewStudentProfile(student.id)}
                >
                  {/* Card header with consistent height and solid color instead of gradient */}
                  <Box 
                    sx={{ 
                      height: 100,
                      // Remove the gradient and use a solid background color
                      backgroundColor: theme.palette.primary.main,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)'
                      }
                    }}
                  />
                  
                  {/* Avatar with consistent positioning */}
                  <Box sx={{ px: 2, position: 'relative', mt: '-40px', mb: 1, height: 40 }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: stringToColor(student.name || 'Student'),
                        border: '4px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: 0,
                        left: 20
                      }}
                    >
                      {student.name?.charAt(0) || 'S'}
                    </Avatar>
                  </Box>
                  
                  {/* Card content with fixed structure */}
                  <CardContent 
                    sx={{ 
                      flexGrow: 1,
                      pt: 1, 
                      pb: 1, 
                      px: 2,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ ml: 8 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        sx={{ 
                          maxWidth: '80%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {student.name || 'Unknown Student'}
                      </Typography>
                      
                      <Tooltip title="Message Student">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={(e) => handleChatWithStudent(student.id, e)}
                          sx={{ 
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.16)'
                            }
                          }}
                        >
                          <MessageIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Box sx={{ mt: 1, mb: 2, ml: 8 }}>
                      <Chip 
                        label={student.department || 'No Department'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark,
                          fontWeight: 500,
                          maxWidth: '100%',
                          overflow: 'hidden',
                        }} 
                      />
                    </Box>
                    
                    {/* Student information with consistent layout */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Year:</strong> {student.year || 'N/A'}
                      </Typography>
                    
                      <Typography variant="body2" color="text.secondary">
                        <strong>Roll No:</strong> {student.rollNo || 'N/A'}
                      </Typography>
                    </Box>
                    
                    {/* Push subjects section to bottom with flex */}
                    <Box sx={{ mt: 'auto' }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600} 
                        sx={{ mb: 1 }}
                      >
                        Selected Subjects:
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 0.5, 
                          minHeight: '40px',  
                          maxHeight: '40px',
                          overflow: 'hidden'
                        }}
                      >
                        {student.subjects && student.subjects.length > 0 ? (
                          <>
                            {student.subjects.slice(0, 3).map((subject, idx) => {
                              const subjectData = SUBJECTS.find(s => s.name === subject.name) || { icon: '📚' };
                              
                              return (
                                <Chip 
                                  key={`${student.id}-${subject.id || idx}`}
                                  label={subject.name}
                                  icon={<span>{subjectData.icon || '📚'}</span>}
                                  size="small"
                                  sx={{ 
                                    pl: 0.5,
                                    height: 24,
                                    '& .MuiChip-label': {
                                      px: 1,
                                      maxWidth: '100px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }
                                  }}
                                />
                              );
                            })}
                            {student.subjects.length > 3 && (
                              <Chip 
                                label={`+${student.subjects.length - 3}`}
                                size="small"
                                sx={{ height: 24 }}
                              />
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No subjects selected
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                  
                  {/* Fixed footer with consistent height */}
                  <CardActions 
                    sx={{ 
                      px: 2, 
                      py: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: alpha(theme.palette.background.default, 0.6)
                    }}
                  >
                    <Button 
                      variant="contained" 
                      size="small" 
                      fullWidth
                      onClick={(e) => handleChatWithStudent(student.id, e)}
                      startIcon={<MessageIcon />}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      Message
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            py: 8, 
            px: 4, 
            textAlign: 'center',
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'grey.300'
          }}
        >
          <img 
            src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png" 
            alt="No students" 
            style={{ width: '120px', height: '120px', opacity: 0.5, marginBottom: '16px' }}
          />
          <Typography variant="h5" color="text.secondary" mb={1} fontWeight={500}>
            No students found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Try adjusting your search or filters
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
          >
            Clear All Filters
          </Button>
        </Paper>
      )}
    </Container>
  );
}

// Add the missing import for alpha
import { alpha } from '@mui/material/styles';

export default AllStudents;