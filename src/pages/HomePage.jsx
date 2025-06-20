import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  School as SchoolIcon,
  Psychology as MentorIcon,
  AutoStories as BookIcon,
  TrendingUp as ProgressIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon,
  Lightbulb as IdeaIcon,
  Group as CommunityIcon
} from '@mui/icons-material';

function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Add website logo/icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <SchoolIcon sx={{ fontSize: 48, color: 'white' }} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block">Welcome to the</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Mentoring Portal
              </span>
            </h1>
            <p className="mt-6 max-w-md mx-auto text-lg md:text-xl text-gray-500 sm:max-w-3xl">
              Connect with mentors who can guide you through your academic journey and help you reach your full potential.
            </p>
            
            <div className="mt-10">
              {!currentUser ? (
                <div className="space-x-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>Login</span>
                    <ArrowIcon className="ml-2" sx={{ fontSize: 20 }} />
                  </Link>
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 md:py-4 md:text-lg md:px-10 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>Sign Up</span>
                    <ArrowIcon className="ml-2" sx={{ fontSize: 20 }} />
                  </Link>
                </div>
              ) : (
                <div>
                  <Link 
                    to={currentUser.role === 'student' ? '/student-home' : '/mentor-home'} 
                    className="inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>Go to {currentUser.role === 'student' ? 'Student Dashboard' : 'Mentor Dashboard'}</span>
                    <ArrowIcon className="ml-2" sx={{ fontSize: 20 }} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12 md:h-24">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
          </svg>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative bg-white py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <IdeaIcon sx={{ fontSize: 48, color: '#4F46E5' }} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform makes it easy to connect and learn
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:scale-102 hover:-translate-y-1">
              <div className="p-6">
                <div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center mb-4">
                  <BookIcon sx={{ fontSize: 24, color: '#2563EB' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Students</h3>
                <p className="text-gray-600">
                  Register, select subjects you need help with, and get matched with experienced mentors who can guide you.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  Register as a Student
                  <ArrowIcon sx={{ fontSize: 16, marginLeft: '4px' }} />
                </Link>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:scale-102 hover:-translate-y-1">
              <div className="p-6">
                <div className="w-12 h-12 rounded-md bg-purple-100 flex items-center justify-center mb-4">
                  <MentorIcon sx={{ fontSize: 24, color: '#9333EA' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Mentors</h3>
                <p className="text-gray-600">
                  Share your expertise, guide students, and track their progress through a dedicated dashboard.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/signup" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                  Register as a Mentor
                  <ArrowIcon sx={{ fontSize: 16, marginLeft: '4px' }} />
                </Link>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:scale-102 hover:-translate-y-1">
              <div className="p-6">
                <div className="w-12 h-12 rounded-md bg-indigo-100 flex items-center justify-center mb-4">
                  <CommunityIcon sx={{ fontSize: 24, color: '#4F46E5' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Learning</h3>
                <p className="text-gray-600">
                  One-on-one mentorship tailored to your specific academic needs and learning style.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/about" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                  Learn More
                  <ArrowIcon sx={{ fontSize: 16, marginLeft: '4px' }} />
                </Link>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:scale-102 hover:-translate-y-1">
              <div className="p-6">
                <div className="w-12 h-12 rounded-md bg-green-100 flex items-center justify-center mb-4">
                  <ProgressIcon sx={{ fontSize: 24, color: '#059669' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your academic growth and development with detailed progress reports and insights.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link to="/features" className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                  See Features
                  <ArrowIcon sx={{ fontSize: 16, marginLeft: '4px' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <StarIcon sx={{ fontSize: 48, color: '#F59E0B' }} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Student Success Stories
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              See how our platform has helped students achieve their academic goals
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-8 relative border border-gray-100">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <StarIcon sx={{ fontSize: 20, color: 'white' }} />
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: '#F59E0B' }} />
                ))}
              </div>
              <blockquote className="italic text-gray-600 mb-4">
                "The mentorship program helped me understand complex topics in computer science that I was struggling with. My mentor was patient and knowledgeable."
              </blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Alex Johnson</p>
                  <p className="text-gray-500 text-sm">Computer Science Student</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-8 relative border border-gray-100">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                <StarIcon sx={{ fontSize: 20, color: 'white' }} />
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: '#F59E0B' }} />
                ))}
              </div>
              <blockquote className="italic text-gray-600 mb-4">
                "My grades in mathematics improved significantly after working with my mentor for just two months. The personalized approach made all the difference."
              </blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 font-bold shadow-sm">
                  S
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Sarah Williams</p>
                  <p className="text-gray-500 text-sm">Engineering Student</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-8 relative border border-gray-100">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <StarIcon sx={{ fontSize: 20, color: 'white' }} />
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: '#F59E0B' }} />
                ))}
              </div>
              <blockquote className="italic text-gray-600 mb-4">
                "The platform matched me with a mentor who truly understood my learning style. Now I feel confident tackling even the most challenging physics problems."
              </blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold shadow-sm">
                  M
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Michael Chen</p>
                  <p className="text-gray-500 text-sm">Physics Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-xl overflow-hidden border border-blue-500/30">
            <div className="px-8 py-10 relative">
              <div className="absolute inset-0 opacity-10" 
                   style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
              
              <div className="lg:flex lg:items-center lg:justify-between relative z-10">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  <span className="block">Ready to get started?</span>
                  <span className="block text-indigo-200">Join our mentoring community today.</span>
                </h2>
                <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                  <div className="inline-flex rounded-md shadow-md">
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 transition-colors hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Get started
                    </Link>
                  </div>
                  <div className="ml-3 inline-flex rounded-md shadow-md">
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 transition-colors hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;