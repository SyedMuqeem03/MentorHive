import { SUBJECT_TO_MENTOR_MAP } from '../../constants/mentorMap';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';

function ChatList() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) return;
    
    // Get all messages where current user is a participant
    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', {
        id: currentUser.uid,
        role: currentUser.role
      }),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      try {
        const conversationsMap = {};
        
        // Process messages to get unique conversations
        for (const docSnap of snapshot.docs) {
          const messageData = docSnap.data();
          
          // Find the other participant
          const partner = messageData.participants.find(
            p => p.id !== currentUser.uid
          );
          
          if (!partner || conversationsMap[partner.id]) continue;
          
          // Get partner details
          const partnerRole = partner.role;
          
          // Check if this is a subject-based chat for a student
          let partnerData = null;
          let partnerName = null;
          
          // If this is a subject ID and we're a student, use mentor mapping
          if (currentUser.role === 'student' && messageData.subjectId && SUBJECT_TO_MENTOR_MAP[messageData.subjectId]) {
            const mentorInfo = SUBJECT_TO_MENTOR_MAP[messageData.subjectId];
            partnerName = mentorInfo.name; // Use the name directly from mapping
            
            // Try to get additional mentor details from Firestore
            const mentorDoc = await getDoc(doc(db, 'mentors', mentorInfo.id));
            if (mentorDoc.exists()) {
              partnerData = mentorDoc.data();
            } else {
              // If mentor document doesn't exist, create a basic profile
              partnerData = {
                name: mentorInfo.name,
                expertise: mentorInfo.expertise || mentorInfo.subject,
                department: 'Academic Faculty'
              };
            }
          } else {
            // Regular case - get partner details from database
            const partnerDoc = await getDoc(doc(db, `${partnerRole}s`, partner.id));
            
            if (partnerDoc.exists()) {
              partnerData = partnerDoc.data();
              // Try multiple possible name fields for maximum compatibility
              partnerName = partnerData.name || partnerData.displayName || partnerData.fullName;
            }
          }
          
          // Add debug logging to check name extraction
          console.log(`Partner data for ${partner.id}:`, partnerData);
          console.log(`Partner name extracted: "${partnerName}"`);

          // If we have partner data, create the conversation
          if (partnerData || partnerName) {
            conversationsMap[partner.id] = {
              id: partner.id,
              role: partnerRole,
              lastMessage: messageData,
              subjectId: messageData.subjectId,
              // Ensure name is properly set with clear fallbacks
              name: partnerName || partnerData?.name || partnerData?.displayName || partnerData?.fullName || 'Unknown User',
              // Extract other useful information
              email: partnerData?.email,
              expertise: partnerData?.expertise || messageData.subject, 
              department: partnerData?.department,
              subject: messageData.subject || partnerData?.subject,
              avatar: partnerData?.avatar || partnerData?.photoURL,
              ...(partnerData || {})
            };
          }
        }
        
        // Convert to array and set state
        setConversations(Object.values(conversationsMap));
        setLoading(false);
      } catch (err) {
        console.error('Error processing conversations:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching messages:', err);
      setError('Failed to load conversations');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Format timestamp for last message
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full border border-gray-100">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p>No conversations yet</p>
            <p className="text-sm">Messages from your {currentUser.role === 'student' ? 'mentors' : 'students'} will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map(convo => {
              const isActive = location.pathname === `/chat/${convo.id}`;
              const hasUnread = convo.lastMessage && 
                convo.lastMessage.senderId !== currentUser.uid && 
                (!convo.lastMessage.readBy || !convo.lastMessage.readBy.includes(currentUser.uid));
                
              return (
                <Link 
                  key={convo.id} 
                  to={convo.subjectId ? `/chat/${convo.subjectId}` : `/chat/${convo.id}`}
                  className={`block hover:bg-blue-50 transition-colors ${isActive ? 'bg-blue-50' : ''}`}
                >
                  <div className="p-4 flex items-center">
                    <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                      isActive 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getInitials(convo.name || 'User')}
                      
                      {/* Role badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                        {convo.role === 'mentor' ? 'M' : 'S'}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 ml-3">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center">
                          <h3 className="text-base font-medium text-gray-800 truncate">
                            {/* Display mentor name with clearer fallbacks */}
                            {convo.name || 
                             (convo.subject ? `${convo.subject} Mentor` : 
                              (convo.expertise ? `${convo.expertise} Expert` : 'Chat Contact'))}
                          </h3>
                          
                          {/* Expertise badge for mentors */}
                          {convo.role === 'mentor' && convo.expertise && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {convo.expertise}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 ml-1 flex-shrink-0">
                          {formatLastMessageTime(convo.lastMessage.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {convo.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}
                          {convo.lastMessage.text}
                        </p>
                        
                        {/* Unread indicator */}
                        {hasUnread && (
                          <div className="ml-2 w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      {/* Subject line if available - always show for clarity */}
                      {convo.subject && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500 italic">
                            Subject: {convo.subject}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;