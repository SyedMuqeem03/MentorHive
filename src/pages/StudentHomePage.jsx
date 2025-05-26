import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from '../components/student/StudentDashboard';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { Grid, Paper, Box, Typography, Button } from '@mui/material';

function StudentHomePage() {
  const { currentUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch student data from Firestore
  useEffect(() => {
    async function fetchStudentData() {
      if (!currentUser) {
        console.log("No current user, cannot fetch student data");
        return;
      }

      try {
        console.log("Fetching student data for user:", currentUser.uid);
        const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));
        
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          console.log("Student data found:", data);
          
          if (!data.hasCompletedProfile) {
            console.log("Profile not complete, redirecting to form");
            navigate('/student-form');
            return;
          }
          
          setStudentData(data);
        } else {
          console.log("No student document exists, redirecting to form");
          navigate('/student-form');
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="student-home-page">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      {studentData && <StudentDashboard studentData={studentData} />}

      <Grid 
        container 
        spacing={4} 
        sx={{ 
          mt: 4,
          justifyContent: 'center' // Centers the grid items horizontally
        }}
      >
        <Grid 
          item 
          xs={12} 
          sm={10} 
          md={8} 
          lg={6} 
          xl={5}
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              width: '100%', // Ensure the paper takes full width of the grid item
              background: 'linear-gradient(120deg, #6366f1, #8b5cf6)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px -10px rgba(99, 102, 241, 0.4)'
              }
            }}
          >
            <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
              <AIIcon sx={{ fontSize: 140 }} />
            </Box>
            
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                AI Mentor Assistant
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Get instant help with your studies, homework, and academic questions from our AI Mentor.
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<AIIcon />}
                onClick={() => navigate('/ai-mentor')}
                sx={{
                  bgcolor: 'white',
                  color: '#6366f1',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'scale(1.05)'
                  },
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  transition: 'all 0.2s',
                  borderRadius: 2
                }}
              >
                Ask AI Mentor
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default StudentHomePage;