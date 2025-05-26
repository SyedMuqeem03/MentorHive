import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Creates a new student profile in Firestore
 * 
 * @param {Object} studentData - The student profile data
 * @returns {Promise<Object>} - Success object
 */
export const createStudentProfile = async (studentData) => {
  try {
    // Ensure we have a userId to use as the document ID
    if (!studentData.userId) {
      throw new Error('User ID is required to create a student profile');
    }

    // Add hasCompletedProfile flag
    const dataToSave = {
      ...studentData,
      hasCompletedProfile: true, // Add this flag
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: 'student'
    };
    
    // Reference to the student document
    const studentRef = doc(db, 'students', studentData.userId);
    
    // Save to Firestore
    await setDoc(studentRef, dataToSave);
    
    console.log('Student profile created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating student profile:', error);
    throw error;
  }
};

/**
 * Retrieves a student profile by user ID
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The student data
 */
export const getStudentProfile = async (userId) => {
  try {
    const studentRef = doc(db, 'students', userId);
    const studentSnap = await getDoc(studentRef);
    
    if (studentSnap.exists()) {
      return { 
        id: studentSnap.id, 
        ...studentSnap.data() 
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }
};

/**
 * Updates an existing student profile
 * 
 * @param {string} userId - The user ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateStudentProfile = async (userId, updateData) => {
  try {
    const studentRef = doc(db, 'students', userId);
    
    // Add updated timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(studentRef, dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error('Error updating student profile:', error);
    throw error;
  }
};

/**
 * Retrieves all students, optionally filtered by department
 * 
 * @param {string} [department] - Optional department filter
 * @returns {Promise<Array>} - Array of student data
 */
export const getAllStudents = async (department = null) => {
  try {
    let studentsQuery;
    
    if (department) {
      studentsQuery = query(
        collection(db, 'students'),
        where('department', '==', department)
      );
    } else {
      studentsQuery = collection(db, 'students');
    }
    
    const querySnapshot = await getDocs(studentsQuery);
    const students = [];
    
    querySnapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Gets students by their selected subjects
 * 
 * @param {number} subjectId - The subject ID to filter by
 * @returns {Promise<Array>} - Array of students interested in the subject
 */
export const getStudentsBySubject = async (subjectId) => {
  try {
    // This is a simplification - in a real app with proper data structure
    // you might need a more complex query or array-contains filter
    const studentsQuery = collection(db, 'students');
    const querySnapshot = await getDocs(studentsQuery);
    
    const matchingStudents = [];
    
    querySnapshot.forEach((doc) => {
      const studentData = doc.data();
      // Check if the student has selected this subject
      const hasSubject = studentData.subjects?.some(
        subject => subject.id === subjectId
      );
      
      if (hasSubject) {
        matchingStudents.push({
          id: doc.id,
          ...studentData
        });
      }
    });
    
    return matchingStudents;
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    throw error;
  }
};

/**
 * Checks if a student profile exists for the given user
 * 
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - Whether the profile exists
 */
export const checkStudentProfileExists = async (userId) => {
  try {
    const studentRef = doc(db, 'students', userId);
    const studentSnap = await getDoc(studentRef);
    return studentSnap.exists();
  } catch (error) {
    console.error('Error checking student profile:', error);
    throw error;
  }
};

// Export other API functions for mentors, sessions, etc.