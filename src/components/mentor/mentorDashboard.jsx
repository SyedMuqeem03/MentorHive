// filepath: c:\Users\Public\Personal\imp\AI\project\src\components\mentor\mentorDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentList from './StudentList';

function MentorDashboard({ currentUser, students, loading }) {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [enhancedStudents, setEnhancedStudents] = useState([]);
  const navigate = useNavigate();

  // Process students to ensure email fields are properly extracted
  useEffect(() => {
    if (students && students.length > 0) {
      const processedStudents = students.map(student => {
        // Ensure we have the student's email, try different possible locations
        const email = student.email || 
                     (student.contact && student.contact.email) || 
                     (student.profile && student.profile.email) ||
                     "No email available";
                     
        return {
          ...student,
          email: email
        };
      });
      
      setEnhancedStudents(processedStudents);
      console.log("Processed students with emails:", processedStudents);
    }
  }, [students]);

  // Handle viewing student profile
  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setActiveTab('profile');
  };

  // Make sure the handleSendMessage uses valid student IDs
  const handleSendMessage = (student) => {
    if (!student || !student.id) {
      console.error("Invalid student data for chat");
      return;
    }
    
    // Ensure we have a valid student ID (not numeric and not too short)
    if (!isNaN(student.id) && student.id.length < 5) {
      console.error(`Invalid student ID: ${student.id}`);
      return;
    }
    
    // For mentors, navigate directly to the student ID
    navigate(`/chat/${student.id}`);
    console.log(`Mentor sending message to student ${student.name} (ID: ${student.id})`);
  };

  // Handle submitting a message
  const handleSubmitMessage = (e) => {
    e.preventDefault();
    
    if (!selectedStudent) return;
    
    // Navigate to chat with this student
    navigate(`/chat/${selectedStudent.id}`);
    
    // Reset modal state
    setMessageText('');
    setShowMessageModal(false);
    setSelectedStudent(null);
  };
  
  // Get the first letter of the mentor's email for avatar
  const getInitials = (email) => {
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section - Added mt-10 for margin-top: 40px */}
      <div className="bg-purple-700 p-6 mt-10 rounded-t-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mr-4">
                {getInitials(currentUser?.email || 'M')}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
                <p className="text-purple-200">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-md font-medium flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Schedule Session
              </button>
              <button className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-md font-medium flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Send Announcement
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex space-x-1">
            <button 
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'students' || (activeTab === 'profile' && selectedStudent)
                  ? 'bg-white text-purple-700' 
                  : 'text-white hover:bg-purple-500'
              }`}
            >
              {activeTab === 'profile' && selectedStudent ? 'Student Profile' : 'Students'}
            </button>
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'sessions' 
                  ? 'bg-white text-purple-700' 
                  : 'text-white hover:bg-purple-500'
              }`}
            >
              Sessions
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'reports' 
                  ? 'bg-white text-purple-700' 
                  : 'text-white hover:bg-purple-500'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(activeTab === 'students' && !selectedStudent) && (
          <StudentList 
            students={enhancedStudents}
            loading={loading}
            onViewProfile={handleViewProfile}
            onSendMessage={handleSendMessage}
          />
        )}

        {(activeTab === 'profile' || (activeTab === 'students' && selectedStudent)) && selectedStudent && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-800">{selectedStudent.name}</h2>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
              </div>
              <button 
                onClick={() => { setActiveTab('students'); setSelectedStudent(null); }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Student Details</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-gray-500">Roll Number</div>
                      <div className="text-gray-900 font-medium">{selectedStudent.rollNo}</div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-gray-500">Department</div>
                      <div className="text-gray-900 font-medium">{selectedStudent.department}</div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 text-gray-500">Email</div>
                      <div className="text-gray-900 font-medium">{selectedStudent.email}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.subjects && selectedStudent.subjects.map(subject => (
                      <span key={subject.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Mentoring History</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center text-gray-500 py-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No mentoring sessions recorded yet</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <button 
                      onClick={() => handleSendMessage(selectedStudent)}
                      className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Send Message
                    </button>
                    
                    <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Schedule Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Scheduled</h3>
            <p className="text-gray-500 mb-6">You don't have any upcoming mentoring sessions.</p>
            
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
              </svg>
              Create New Session
            </button>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-500 mb-6">Progress reports will be generated after completing sessions.</p>
            
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
              </svg>
              Create Template
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {(activeTab === 'students' && !selectedStudent && students.length > 0) && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{students.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Sessions Completed</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">0</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Sessions</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">0</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Message to {selectedStudent.name}</h3>
              <button 
                onClick={() => { setShowMessageModal(false); setSelectedStudent(null); }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitMessage} className="p-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                required
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowMessageModal(false); setSelectedStudent(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorDashboard;