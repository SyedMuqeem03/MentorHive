import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { SUBJECT_TO_MENTOR_MAP } from '../../constants/mentorMap';

function ChatPage() {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageGroups, setMessageGroups] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Add this function near the top of your component, before any useEffects
  const getInitials = (name) => {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to create welcome message
  const createWelcomeMessage = async (partnerId, partnerRole, subjectName = null) => {
    try {
      // For students, make sure we're using the correct mentor ID from mapping
      if (currentUser.role === 'student' && SUBJECT_TO_MENTOR_MAP[chatId]) {
        partnerId = SUBJECT_TO_MENTOR_MAP[chatId].id;
      }
      
      // Verify the partner ID - avoid using numeric short IDs which are likely wrong
      if (!isNaN(partnerId) && partnerId.length < 5) {
        console.error(`Suspicious partner ID in welcome message: "${partnerId}". Trying to fix.`);
        if (currentUser.role === 'student' && SUBJECT_TO_MENTOR_MAP[chatId]) {
          partnerId = SUBJECT_TO_MENTOR_MAP[chatId].id;
        }
      }
      
      let messageText = '';
      
      if (subjectName) {
        messageText = `Hello! I'm your mentor for ${subjectName}. How can I help you with this subject today?`;
      } else {
        // Get partner's name if available
        let partnerName = 'your ' + (partnerRole === 'mentor' ? 'mentor' : 'student');
        
        if (partnerRole === 'mentor') {
          // Look for mentor name in our mapping
          const mentorInfo = Object.values(SUBJECT_TO_MENTOR_MAP).find(m => m.id === partnerId);
          if (mentorInfo) {
            partnerName = mentorInfo.name;
          }
        } else {
          // For students, try to get their name from the database
          const studentDoc = await getDoc(doc(db, 'students', partnerId));
          if (studentDoc.exists() && studentDoc.data().name) {
            partnerName = studentDoc.data().name;
          }
        }
        
        messageText = `Hello! I'm ${partnerName}. How can I help you today?`;
      }
      
      console.log(`Creating welcome message with correct partner ID: ${partnerId} as ${partnerRole}`);
      
      // Create the welcome message with the correct partner ID
      await addDoc(collection(db, 'messages'), {
        text: messageText,
        senderId: partnerId, // This should be the partner's ID
        senderRole: partnerRole,
        participants: [
          { id: currentUser.uid, role: currentUser.role },
          { id: partnerId, role: partnerRole }
        ],
        participantsArray: [currentUser.uid, partnerId], // Add for compatibility
        read: false,
        timestamp: serverTimestamp(),
        isRealMessage: true,
        subjectId: subjectName ? chatId : null // Store subject ID if this is a subject-based chat
      });
    } catch (err) {
      console.error("Error creating welcome message:", err);
    }
  };

  // Add this helper function to ensure consistent participant format
  const createParticipantArray = (user1Id, user1Role, user2Id, user2Role) => {
    return [
      { id: user1Id, role: user1Role },
      { id: user2Id, role: user2Role }
    ];
  };

  // Fetch chat partner details
  useEffect(() => {
    const fetchPartner = async () => {
      if (!currentUser || !chatId) return;
      
      try {
        // First, check if this is a subject-based chat for a student
        if (currentUser.role === 'student' && SUBJECT_TO_MENTOR_MAP[chatId]) {
          // This is a subject ID, get the mentor info
          const mentorInfo = SUBJECT_TO_MENTOR_MAP[chatId];
          console.log(`Connecting to subject mentor: ${mentorInfo.name} (${mentorInfo.id})`);
          
          // Check if mentor exists in Firestore, otherwise create
          const mentorDocRef = doc(db, 'mentors', mentorInfo.id);
          const mentorDoc = await getDoc(mentorDocRef);
          
          if (mentorDoc.exists()) {
            // Use existing mentor data
            const mentorData = mentorDoc.data();
            setPartner({
              id: mentorInfo.id,
              ...mentorData,
              name: mentorData.name || mentorInfo.name
            });
          } else {
            // Create mentor document
            const mentorData = {
              name: mentorInfo.name,
              email: mentorInfo.email,
              role: 'mentor',
              department: 'Academic Faculty',
              hasCompletedProfile: true,
              isRealMentor: true
            };
            
            await setDoc(doc(db, 'mentors', mentorInfo.id), mentorData);
            setPartner({ id: mentorInfo.id, ...mentorData });
          }
        } else {
          // For direct chats (non-subject based)
          const collectionName = currentUser.role === 'student' ? 'mentors' : 'students';
          const partnerDocRef = doc(db, collectionName, chatId);
          const partnerDoc = await getDoc(partnerDocRef);
          
          if (partnerDoc.exists()) {
            setPartner({ id: chatId, ...partnerDoc.data() });
          } else {
            setError(`Could not find chat partner. Please ensure they have an account.`);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching partner details:', err);
        setError(`Failed to load chat partner details: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPartner();
  }, [currentUser, chatId]);

  // Subscribe to messages in real-time
  useEffect(() => {
    if (!currentUser || !chatId) return;
    
    setLoading(true);
    
    try {
      // Critical fix: Normalize the chatId properly
      let normalizedPartnerId = chatId;
      
      // First check if we have a direct mapping for this ID
      if (currentUser.role === 'student' && SUBJECT_TO_MENTOR_MAP[chatId]) {
        normalizedPartnerId = SUBJECT_TO_MENTOR_MAP[chatId].id;
        console.log(`Using direct mentor mapping for ${chatId}: ${normalizedPartnerId}`);
      }
      // If not in direct mapping, check if using numeric ID
      else if (!isNaN(chatId) && String(chatId).length < 10) {
        console.warn(`Suspicious partner ID in useEffect: "${chatId}". Trying to find proper mentor ID.`);
        
        // If we are a student, we need to map this to a mentor ID
        if (currentUser.role === 'student') {
          // Try to find a matching mentor for the subject ID/number
          const foundMentor = Object.values(SUBJECT_TO_MENTOR_MAP)[Number(chatId) - 1]; // Try index-based lookup
          
          if (foundMentor) {
            normalizedPartnerId = foundMentor.id;
            console.log(`Found mentor by index for subject ${chatId}: ${normalizedPartnerId}`);
          } else {
            // Fallback to a valid mentor ID - use the first one as default
            normalizedPartnerId = Object.values(SUBJECT_TO_MENTOR_MAP)[0].id;
            console.error(`Cannot find proper mentor for subject ${chatId}, using default: ${normalizedPartnerId}`);
          }
        }
      }
      
      // Use the normalized partner ID for fetching messages
      const q = query(
        collection(db, "messages"),
        where("participantsArray", "array-contains", currentUser.uid)
        // Remove orderBy to avoid the index requirement
      );
      
      // Set up REAL-TIME subscription to messages
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData = [];
        
        querySnapshot.forEach(doc => {
          const messageData = doc.data();
          
          // Much more permissive message filtering logic
          let shouldIncludeMessage = false;
          
          // First check participantsArray which is more reliable
          if (Array.isArray(messageData.participantsArray)) {
            shouldIncludeMessage = messageData.participantsArray.includes(normalizedPartnerId) &&
                         messageData.participantsArray.includes(currentUser.uid);
          }
          
          // If that didn't match, check the structured participants array
          if (!shouldIncludeMessage && Array.isArray(messageData.participants)) {
            if (typeof messageData.participants[0] === 'object') {
              // Object format: check if both users are in the participants array
              const hasCurrentUser = messageData.participants.some(p => 
                p.id === currentUser.uid
              );
              const hasPartner = messageData.participants.some(p => 
                p.id === normalizedPartnerId
              );
              shouldIncludeMessage = hasCurrentUser && hasPartner;
            } else {
              // String format: check if both IDs are in the array
              shouldIncludeMessage = messageData.participants.includes(normalizedPartnerId) &&
                           messageData.participants.includes(currentUser.uid);
            }
          }

          // Log the message filtering decision for debugging
          if (shouldIncludeMessage) {
            console.log(`Including message: "${messageData.text?.substring(0,20) || 'No text'}..." - from ${messageData.senderId || 'unknown'}`);
          } else {
            console.log(`Excluding message: "${messageData.text?.substring(0,20) || 'No text'}..." - participants don't match chat`);
          }

          // Include the message if we've determined it belongs in this chat
          if (shouldIncludeMessage) {
            // Improve logging to diagnose issues
            console.log(`Including message: "${messageData.text?.substring(0,20) || 'No text'}..." with senderId: ${messageData.senderId || 'Missing ID'}`);
            
            // Make sure we have a valid senderId
            let senderId = messageData.senderId;
            
            // If no senderId, try to infer it
            if (!senderId) {
              if (messageData.sender) {
                senderId = messageData.sender;
              } else if (messageData.senderRole) {
                // If we know the role, we can determine who sent it
                senderId = (messageData.senderRole === currentUser.role) 
                  ? currentUser.uid 
                  : normalizedPartnerId;
              }
            }
            
            // Normalize message format for consistent display
            messagesData.push({
              id: doc.id,
              ...messageData,
              senderId: senderId, // Use our verified senderId
              senderRole: messageData.senderRole || (senderId === currentUser.uid ? currentUser.role : 'partner')
            });
          } else {
            console.log(`Excluding message: "${messageData.text?.substring(0,20) || 'No text'}..."`);
          }
        });
        
        // Add this after fetching messages
        // Manual sorting
        messagesData.sort((a, b) => {
          const timeA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate().getTime() : a.timestamp.getTime()) : 0;
          const timeB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate().getTime() : b.timestamp.getTime()) : 0;
          return timeA - timeB;
        });
        
        console.log(`Retrieved ${messagesData.length} messages in real-time`);
        setMessages(messagesData);
        
        // Group messages by date
        const groups = {};
        messagesData.forEach(message => {
          // Debug any issues with message format
          if (!message.text) {
            console.warn("Message missing text field:", message);
          }
          
          // Add default timestamp if missing
          if (!message.timestamp) {
            console.warn("Message missing timestamp, using current time:", message);
            message.timestamp = new Date(); // Use current time as fallback
          }
          
          // Format the date with better error handling
          let date;
          try {
            if (typeof message.timestamp.toDate === 'function') {
              date = message.timestamp.toDate().toLocaleDateString();
            } else if (message.timestamp instanceof Date) {
              date = message.timestamp.toLocaleDateString();
            } else {
              date = new Date().toLocaleDateString();
            }
          } catch (err) {
            console.warn("Invalid timestamp format:", message.timestamp);
            date = "Today";
          }
          
          // Create the group if it doesn't exist
          if (!groups[date]) {
            groups[date] = [];
          }
          
          // Add the message to its date group
          groups[date].push(message);
        });
        
        setMessageGroups(groups);
        setLoading(false);
        
        // Auto scroll to bottom when new messages arrive
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Create welcome message if no messages exist
        if (messagesData.length === 0 && partner) {
          // Only create welcome message if we have a partner and there are no messages
          const welcomePartnerId = normalizedPartnerId;
          const welcomePartnerRole = currentUser.role === 'student' ? 'mentor' : 'student';
          
          console.log(`Creating welcome message with correct partner ID: ${welcomePartnerId}`);
          
          // Use a small delay to ensure React doesn't get confused with state updates
          setTimeout(() => {
            createWelcomeMessage(welcomePartnerId, welcomePartnerRole, partner?.subject);
          }, 300);
        }
      }, (error) => {
        console.error("Error listening to messages:", error);
        
        // Specific handling for index errors
        if (error.message.includes("requires an index")) {
          const indexUrl = error.message.split("create it here: ")[1];
          setError(
            <div>
              <p>This app needs a database index to be created.</p>
              <p className="mt-2">Please:</p>
              <ol className="list-decimal ml-5 mt-2">
                <li>Click the "Create Index" button below</li>
                <li>On the Firebase page that opens, click "Create Index"</li>
                <li>Wait a few minutes for the index to build</li>
                <li>Return here and click "Retry"</li>
              </ol>
              <div className="mt-4 flex space-x-4">
                <a 
                  href={indexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Index
                </a>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          );
        } else {
          setError("Error loading messages: " + error.message);
        }
        setLoading(false);
      });
      
      // Clean up the listener when component unmounts
      return () => unsubscribe();
      
    } catch (error) {
      setError("Error setting up messages: " + error.message);
      console.error("Error in messages setup:", error);
      setLoading(false);
    }
  }, [currentUser, chatId, partner]);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Check if timestamp is a Firestore timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      // Convert Firestore timestamp to JavaScript Date
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's a timestamp number
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Fallback if we can't format the timestamp
    return 'Unknown time';
  };

  // Debug: Log message format whenever messages change
  useEffect(() => {
    console.log("Current messages:", messages.map(m => ({
      id: m.id,
      text: m.text?.substring(0, 20) + (m.text?.length > 20 ? '...' : ''),
      senderId: m.senderId,
      format: Array.isArray(m.participants) 
        ? (typeof m.participants[0] === 'object' ? 'object format' : 'array format') 
        : 'unknown format'
    })));
  }, [messages]);

  // Add debugging for message groups
  useEffect(() => {
    // Log message groups whenever they change
    if (Object.keys(messageGroups).length > 0) {
      console.log("Message groups:", Object.keys(messageGroups).map(date => ({
        date,
        messageCount: messageGroups[date].length,
        sampleMessage: messageGroups[date][0]?.text?.substring(0, 20)
      })));
    } else {
      console.warn("No message groups to display");
    }
  }, [messageGroups]);
  
  // Move this useEffect here - BEFORE any conditionals in the component
  // This will ensure it always runs in the same order
  useEffect(() => {
    if (currentUser) {
      debugFetchAllMessages();
    }
  }, [currentUser]);
  
  // Enhanced debugging function - Just the function definition
  const debugFetchAllMessages = async () => {
    try {
      if (!currentUser) return; // Safety check
      
      // First get ALL messages
      const allMessagesQuery = query(collection(db, "messages"));
      const snapshot = await getDocs(allMessagesQuery);
      
      // Then get messages specific to this user
      const userMessagesQuery = query(
        collection(db, "messages"),
        where("participantsArray", "array-contains", currentUser.uid)
      );
      
      const userSnapshot = await getDocs(userMessagesQuery);
      
      userSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Message: "${data.text?.substring(0, 20) || 'No text'}..." - Participants: ${JSON.stringify(data.participantsArray)}`);
      });
    } catch (error) {
      console.error("Error debugging messages:", error);
    }
  };

  // NOW place your conditionals
  // Error display
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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

  // Loading state
  if (loading || !partner) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Add this function before your return statement
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Normalize the partner ID
      let partnerId = chatId;
      let partnerRole;
      
      // Partner ID validation for students
      if (currentUser.role === 'student') {
        // Direct check if we have a mentor mapping for this subject
        if (SUBJECT_TO_MENTOR_MAP[chatId]) {
          // Use the exact mentor ID from our mapping
          partnerId = SUBJECT_TO_MENTOR_MAP[chatId].id;
        }
        // If not in direct mapping, check if using numeric ID
        else if (!isNaN(chatId) && String(chatId).length < 10) {
          console.warn(`Suspicious partner ID detected: "${chatId}". Using proper mentor ID instead.`);
          
          // First, try to use chatId as array index (for 1-based navigation)
          const mentorsList = Object.values(SUBJECT_TO_MENTOR_MAP);
          const mentorIndex = parseInt(chatId) - 1;
          
          if (mentorsList[mentorIndex]) {
            partnerId = mentorsList[mentorIndex].id;
            console.log(`Mapped numeric ID ${chatId} to proper mentor ID: ${partnerId}`);
          } else {
            // Fallback to first mentor if index is invalid
            partnerId = Object.values(SUBJECT_TO_MENTOR_MAP)[0].id;
            console.warn(`Invalid mentor index ${mentorIndex}, using default mentor ID: ${partnerId}`);
          }
        }
        
        partnerRole = 'mentor';
      } else {
        // For mentors, the partner is a student
        partnerRole = 'student';
      }
      
      console.log(`Sending message to ${partnerRole} with ID: ${partnerId}`);
      console.log(`Current user: ${currentUser.uid} (${currentUser.role})`);
      
      // Create message
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: currentUser.uid,
        senderRole: currentUser.role,
        timestamp: serverTimestamp(),
        // Ensure participants array is consistent
        participants: [
          { id: currentUser.uid, role: currentUser.role },
          { id: partnerId, role: partnerRole }
        ],
        // This simple array format is critical for the query to work
        participantsArray: [currentUser.uid, partnerId],
        read: false
      });
      
      // Clear input field
      setNewMessage('');
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      setError("Error sending message: " + error.message);
      console.error("Error sending message:", error);
    }
  };

  // Rest of your component...
  
  // Return your main JSX here
  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex items-center shadow-md">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-800 font-bold mr-3 shadow-md border-2 border-blue-300">
          {getInitials(partner?.name || '')}
        </div>
        <div>
          <h2 className="font-semibold text-lg">{partner?.name}</h2>
          <p className="text-blue-100 text-sm flex items-center">
            {partner?.role === 'mentor' ? 'Mentor' : 'Student'}
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full inline-block"></span>
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50 border-x border-gray-100"
      >
        {messages.length === 0 ? (
          // No messages state
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-center font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : Object.keys(messageGroups).length > 0 ? (
          // Messages by date groups
          Object.keys(messageGroups).map(date => (
            <div key={date} className="mb-6">
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600 shadow-sm border border-gray-300/30">
                  {date}
                </span>
              </div>
              
              {messageGroups[date].map(message => {
                // Ensure message has all required fields
                if (!message || !message.text) {
                  console.warn("Invalid message in render:", message);
                  return null;
                }
                
                // Improved logic to determine if message is from current user
                // Add debugging to understand message sender identification
                const isCurrentUser = message.senderId === currentUser.uid;
                console.log(`Message: "${message.text.substring(0,10)}..." - senderId: ${message.senderId}, currentUser: ${currentUser.uid}, isCurrentUser: ${isCurrentUser}`);
                
                return (
                  <div 
                    key={message.id} 
                    className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isCurrentUser 
                          ? 'bg-blue-500 text-white ml-auto shadow-md' 
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div 
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp ? formatTime(message.timestamp) : 'Sending...'}
                        {/* Add sender info for debugging */}
                        <span className="ml-2 opacity-50">
                          {isCurrentUser ? '(You)' : `(${message.senderRole || 'Other'})`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          // No message groups but messages exist - fallback
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-center font-medium">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 bg-white shadow-inner">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;