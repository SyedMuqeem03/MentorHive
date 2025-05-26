import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleRoute from './components/auth/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy-loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const StudentHomePage = lazy(() => import('./pages/StudentHomePage'));
const MentorHomePage = lazy(() => import('./pages/MentorHomePage'));
const StudentFormPage = lazy(() => import('./pages/StudentFormPage'));
const ChatContainer = lazy(() => import('./pages/ChatContainer'));
const AIAssistantChat = lazy(() => import('./pages/AIAssistantChat'));
const MentorsPage = lazy(() => import('./pages/MentorsPage'));
const MyMentorsPage = lazy(() => import('./pages/MyMentorsPage'));

// Updated component to handle redirects based on auth status
// This component will show HomePage for non-authenticated users
function HomePageWithAuth() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  // If user is authenticated, redirect based on role
  if (currentUser) {
    if (currentUser.role === 'student') {
      return <Navigate to="/student-home" />;
    } else if (currentUser.role === 'mentor') {
      return <Navigate to="/mentor-home" />;
    } else {
      // If role is unknown, redirect to login
      return <Navigate to="/login" />;
    }
  }
  
  // Show HomePage for non-authenticated users
  return <HomePage />;
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <Navbar />
          <main className="min-h-screen">
            <Suspense fallback={<LoadingSpinner center text="Loading..." />}>
              <Routes>
                {/* Modified route to use the new component */}
                <Route path="/" element={<HomePageWithAuth />} />
                
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Role-specific routes */}
                <Route path="/student-home" element={
                  <PrivateRoute>
                    <RoleRoute requiredRole="student">
                      <StudentHomePage />
                    </RoleRoute>
                  </PrivateRoute>
                } />
                
                <Route path="/mentor-home" element={
                  <PrivateRoute>
                    <RoleRoute requiredRole="mentor">
                      <MentorHomePage />
                    </RoleRoute>
                  </PrivateRoute>
                } />
                
                {/* Students directory for mentors */}
                <Route path="/mentors" element={
                  <PrivateRoute>
                    <RoleRoute requiredRole="student">
                      <MyMentorsPage />
                    </RoleRoute>
                  </PrivateRoute>
                } />
                
                {/* Add AI Assistant chat route */}
                <Route path="/ai-mentor" element={
                  <PrivateRoute>
                    <RoleRoute requiredRole="student">
                      <AIAssistantChat />
                    </RoleRoute>
                  </PrivateRoute>
                } />
                
                {/* Chat routes */}
                <Route path="/chat" element={
                  <PrivateRoute>
                    <ChatContainer />
                  </PrivateRoute>
                } />
                
                <Route path="/chat/:chatId" element={
                  <PrivateRoute>
                    <ChatContainer />
                  </PrivateRoute>
                } />
                
                <Route path="/student-form" element={
                  <PrivateRoute>
                    <RoleRoute requiredRole="student">
                      <StudentFormPage />
                    </RoleRoute>
                  </PrivateRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <button 
                      onClick={() => window.location.href = '/'} 
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Go Home
                    </button>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;