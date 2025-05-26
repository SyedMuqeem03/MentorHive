import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MentorDashboard from '../components/mentor/mentorDashboard';
import { collection, query, getDocs, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function MentorHomePage() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students from Firestore
  useEffect(() => {
    async function fetchStudents() {
      if (!currentUser) return;

      try {
        // Get all students who have completed their profile
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
        
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [currentUser]);

  // Create a test student if none exist
  useEffect(() => {
    const createTestStudent = async () => {
      if (students.length === 0 && !loading && currentUser) {
        try {
          const testStudentId = "test-student-" + Math.random().toString(36).substring(2, 9);
          const testStudentRef = doc(db, 'students', testStudentId);
          
          await setDoc(testStudentRef, {
            name: "Test Student",
            email: "student@example.com",
            role: "student",
            department: "Computer Science",
            rollNo: "CS2023-001",
            hasCompletedProfile: true,
            subjects: [
              { id: "sub1", name: "Machine Learning" },
              { id: "sub2", name: "Data Structures" }
            ]
          });
          
          // Refresh students list
          setStudents(prev => [...prev, {
            id: testStudentId,
            name: "Test Student",
            email: "student@example.com",
            role: "student",
            department: "Computer Science",
            rollNo: "CS2023-001",
            hasCompletedProfile: true,
            subjects: [
              { id: "sub1", name: "Machine Learning" },
              { id: "sub2", name: "Data Structures" }
            ]
          }]);
        } catch (error) {
          console.error("Error creating test student:", error);
        }
      }
    };
    
    // Only in development
    if (process.env.NODE_ENV !== 'production') {
      createTestStudent();
    }
  }, [students, loading, currentUser]);

  return (
    <div className="pt-16 pb-10 px-4 sm:px-6 lg:px-8">
      <MentorDashboard currentUser={currentUser} students={students} loading={loading} />
    </div>
  );
}

export default MentorHomePage;