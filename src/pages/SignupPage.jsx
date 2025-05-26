import Signup from '../components/auth/Signup';
import { Link } from 'react-router-dom';

function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Side - Signup Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 order-2 md:order-1">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="md:hidden flex justify-center mb-6">
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Create your account
            </span>
          </h2>
          <p className="text-center text-sm text-gray-500 mt-2">
            Or{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 sm:rounded-xl shadow-xl transform transition-all hover:shadow-2xl">
            <Signup />
          </div>
          
          {/* Feature cards similar to HomePage */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md transform transition-all hover:scale-105 duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-900">Alex Johnson</span>
              </div>
              <p className="text-xs text-gray-500 italic">"The mentorship program helped me understand complex topics in computer science."</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md transform transition-all hover:scale-105 duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 font-bold">
                  S
                </div>
                <span className="text-sm font-medium text-gray-900">Sarah Williams</span>
              </div>
              <p className="text-xs text-gray-500 italic">"My grades improved significantly after working with my mentor."</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Illustration/Content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden order-1 md:order-2">
        {/* Background Shapes - Match HomePage animations */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10">
          <div className="h-16 w-16 bg-white/10 backdrop-filter backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Join Our Community!</h1>
          <p className="text-purple-100 text-lg mb-8 max-w-md">
            Sign up today to connect with mentors and start your learning journey with personalized guidance.
          </p>
          
          {/* Feature cards similar to HomePage */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-lg p-6 transform transition-all hover:scale-105 duration-300">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">For Students</h3>
              <p className="text-purple-100">Get matched with mentors who can help you excel in your subjects and reach your academic goals faster.</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-lg p-6 transform transition-all hover:scale-105 duration-300">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">For Mentors</h3>
              <p className="text-purple-100">Share your knowledge, guide students to success, and make a difference in their educational journey.</p>
            </div>
          </div>
        </div>
        
        {/* Wave pattern from HomePage */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10 opacity-30">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-24">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-white"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;