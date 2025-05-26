import { useLocation } from 'react-router-dom';

function Footer() {
  const location = useLocation();
  
  // List of routes where footer should be hidden
  const hideFooterRoutes = ['/chat', '/video-call'];
  
  // Return null (no rendering) if on a route where footer should be hidden
  if (hideFooterRoutes.includes(location.pathname)) return null;
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Mentoring Portal. All rights reserved.</p>
        <div className="space-x-6">
          <a href="/about" className="text-sm text-gray-500 hover:text-gray-900">About</a>
          <a href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</a>
          <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
          <a href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;