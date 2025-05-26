import { useParams } from 'react-router-dom';
import ChatList from '../components/chat/ChatList';
import ChatPage from '../components/chat/ChatPage';

function ChatContainer() {
  const { chatId } = useParams();
  
  return (
    <div className="bg-gray-100 min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List - Sidebar */}
          <div className="lg:col-span-1 h-full">
            <ChatList />
          </div>
          
          {/* Chat Area or Welcome Screen */}
          <div className="lg:col-span-3 h-full">
            {chatId ? (
              <ChatPage />
            ) : (
              <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Messages</h2>
                  <p className="text-gray-600 max-w-md">
                    Select a conversation from the sidebar to start chatting with your {
                      localStorage.getItem('userRole') === 'student' ? 'mentors' : 'students'
                    }.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;