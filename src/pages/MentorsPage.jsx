import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardContent, Box, TextField, MenuItem, Button, Avatar, Chip, Divider, Paper } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getMentorId } from '../constants/mentorMap';

// Create a new Students page component
function StudentsPage() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [subjectFilter, setSubjectFilter] = useState('');
  const navigate = useNavigate();

  // Define departments for filtering
  const DEPARTMENTS = [
    'All Departments',
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology'
  ];

  // Define subjects for filtering
  const SUBJECTS = [
    '', // Empty option for "All Subjects"
    'Machine Learning',
    'Artificial Intelligence',
    'Formal Languages and Automata Theory',
    'Scripting Languages',
    'Fundamentals of Internet of Things',
    'Environmental Science',
    'IOMP'
  ];

  // Create a function to generate random avatar colors
  const stringToColor = (string) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
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
      
    return matchesSearch && matchesDepartment && matchesSubject;
  });

  // Improve the chat navigation to use the proper mentor IDs
  const handleMessageStudent = (student) => {
    if (!student || !student.id) {
      console.error("Invalid student data for chat");
      return;
    }
    
    // Make sure we use a proper Firebase ID
    if (!isNaN(student.id) && student.id.length < 5) {
      console.error(`Invalid student ID: ${student.id}`);
      return;
    }
    
    // For mentors, navigate directly to the student ID
    navigate(`/chat/${student.id}`);
    console.log(`Mentor sending message to student ${student.name} (ID: ${student.id})`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold">Students Directory</Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          label="Search students"
          variant="outlined"
          fullWidth
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
        />

        <TextField
          select
          label="Department"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          variant="outlined"
          sx={{ minWidth: 200 }}
        >
          {DEPARTMENTS.map((department) => (
            <MenuItem key={department} value={department}>
              {department}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Subject"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          variant="outlined"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Subjects</MenuItem>
          {SUBJECTS.map((subject) => (
            <MenuItem key={subject} value={subject}>
              {subject || "All Subjects"}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing {filteredStudents.length} of {students.length} students
      </Typography>

      {/* Students Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </Box>
      ) : filteredStudents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card 
                elevation={2} 
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: stringToColor(student.name || 'Student'),
                        mr: 2
                      }}
                    >
                      {student.name?.charAt(0) || 'S'}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{student.name || 'Unknown Student'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.department || 'No Department'} • {student.year || 'Unknown Year'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Roll No: {student.rollNo || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Selected Subjects:
                  </Typography>
                  
                  {student.subjects && student.subjects.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {student.subjects.map((subject, idx) => (
                        <Chip 
                          key={`${student.id}-${subject.id || idx}`}
                          label={subject.name}
                          icon={<span>{subject.icon || '📚'}</span>}
                          size="small"
                          sx={{ 
                            pl: 0.5,
                            bgcolor: `rgba(${subject.id * 40 % 255}, ${subject.id * 70 % 255}, ${subject.id * 90 % 255}, 0.1)`
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No subjects selected
                    </Typography>
                  )}
                  
                  <Box mt={2}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      fullWidth
                      onClick={() => handleMessageStudent(student)}
                    >
                      Message Student
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            py: 6, 
            px: 4, 
            textAlign: 'center',
            bgcolor: 'grey.50',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary" mb={1}>
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default StudentsPage;