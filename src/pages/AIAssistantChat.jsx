import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Groq } from 'groq-sdk';
import { useNavigate } from 'react-router-dom';
import { 
  SmartToy as AIIcon, 
  Link as LinkIcon,
  LibraryBooks as ResourceIcon,
  QuestionAnswer as QAIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import '../index.css'; // Ensure Tailwind CSS is imported

// Define constants
const AI_ID = "ai-mentor";
const AI_NAME = "AI Mentor";
const API_KEY = (() => {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  // Add sample key for demo mode if no valid key is available
  if (!envKey || envKey === "MENTOR_AI") {
    console.warn("Using demo mode with sample responses (no valid API key found)");
    return null;
  }
  return envKey;
})();   // Use environment variable or default to "MENTOR_AI"

// Educational resources by subject
const EDUCATIONAL_RESOURCES = {
  math: [
    { name: "Khan Academy Math", url: "https://www.khanacademy.org/math", type: "interactive" },
    { name: "Paul's Online Math Notes", url: "https://tutorial.math.lamar.edu/", type: "notes" },
    { name: "Brilliant Math Courses", url: "https://brilliant.org/courses/?topic=math", type: "interactive" },
    { name: "Desmos Graphing Calculator", url: "https://www.desmos.com/calculator", type: "tool" },
    { name: "MIT OpenCourseWare Math", url: "https://ocw.mit.edu/courses/mathematics/", type: "course" }
  ],
  physics: [
    { name: "Physics Classroom", url: "https://www.physicsclassroom.com/", type: "tutorial" },
    { name: "Khan Academy Physics", url: "https://www.khanacademy.org/science/physics", type: "interactive" },
    { name: "PhET Physics Simulations", url: "https://phet.colorado.edu/en/simulations/category/physics", type: "simulation" },
    { name: "Feynman Lectures on Physics", url: "https://www.feynmanlectures.caltech.edu/", type: "book" },
    { name: "MIT OpenCourseWare Physics", url: "https://ocw.mit.edu/courses/physics/", type: "course" }
  ],
  chemistry: [
    { name: "Khan Academy Chemistry", url: "https://www.khanacademy.org/science/chemistry", type: "interactive" },
    { name: "Chemistry LibreTexts", url: "https://chem.libretexts.org/", type: "textbook" },
    { name: "ChemCollective", url: "http://chemcollective.org/", type: "simulation" },
    { name: "Periodic Table", url: "https://ptable.com/", type: "tool" },
    { name: "Royal Society of Chemistry", url: "https://edu.rsc.org/", type: "resource" }
  ],
  biology: [
    { name: "Khan Academy Biology", url: "https://www.khanacademy.org/science/biology", type: "interactive" },
    { name: "Biology LibreTexts", url: "https://bio.libretexts.org/", type: "textbook" },
    { name: "iBiology", url: "https://www.ibiology.org/", type: "video" },
    { name: "Learn.Genetics", url: "https://learn.genetics.utah.edu/", type: "interactive" },
    { name: "BioInteractive", url: "https://www.biointeractive.org/", type: "resource" }
  ],
  history: [
    { name: "Khan Academy History", url: "https://www.khanacademy.org/humanities/world-history", type: "interactive" },
    { name: "Crash Course History", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtMwmepBjTSG593eG7ObzO7s", type: "video" },
    { name: "World History Encyclopedia", url: "https://www.worldhistory.org/", type: "encyclopedia" },
    { name: "History.com", url: "https://www.history.com/topics", type: "resource" },
    { name: "Digital Public Library of America", url: "https://dp.la/", type: "primary-source" }
  ],
  literature: [
    { name: "Project Gutenberg", url: "https://www.gutenberg.org/", type: "book" },
    { name: "SparkNotes Literature", url: "https://www.sparknotes.com/lit/", type: "study-guide" },
    { name: "Poetry Foundation", url: "https://www.poetryfoundation.org/", type: "resource" },
    { name: "LitCharts", url: "https://www.litcharts.com/", type: "study-guide" },
    { name: "Open Yale Courses: Literature", url: "https://oyc.yale.edu/english", type: "course" }
  ],
  "machine learning": [
    { name: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course" },
    { name: "Andrew Ng's Machine Learning on Coursera", url: "https://www.coursera.org/learn/machine-learning", type: "course" },
    { name: "Kaggle Learn Machine Learning", url: "https://www.kaggle.com/learn/machine-learning", type: "interactive" },
    { name: "Fast.ai Deep Learning", url: "https://www.fast.ai/", type: "course" },
    { name: "TensorFlow Documentation", url: "https://www.tensorflow.org/learn", type: "documentation" }
  ],
  "artificial intelligence": [
    { name: "Elements of AI", url: "https://www.elementsofai.com/", type: "course" },
    { name: "AI for Everyone by Andrew Ng", url: "https://www.coursera.org/learn/ai-for-everyone", type: "course" },
    { name: "MIT OCW Artificial Intelligence", url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-034-artificial-intelligence-fall-2010/", type: "course" },
    { name: "AI Experiments with Google", url: "https://experiments.withgoogle.com/collection/ai", type: "interactive" },
    { name: "Berkeley Artificial Intelligence Materials", url: "https://inst.eecs.berkeley.edu/~cs188/fa21/", type: "course" }
  ],
  "formal languages": [
    { name: "Theory of Computation (Stanford)", url: "https://online.stanford.edu/courses/soe-ycsautomata-automata-theory", type: "course" },
    { name: "Introduction to Automata Theory by Jeffrey D. Ullman", url: "https://www.amazon.com/Introduction-Automata-Theory-Languages-Computation/dp/0321455363", type: "book" },
    { name: "Formal Languages and Automata (MIT)", url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-045j-automata-computability-and-complexity-spring-2011/", type: "course" },
    { name: "Theory of Computation NPTEL", url: "https://nptel.ac.in/courses/106/103/106103070/", type: "course" },
    { name: "JFLAP - Software for Experimenting with Formal Languages", url: "https://www.jflap.org/", type: "tool" }
  ],
  "scripting languages": [
    { name: "Python.org Official Tutorials", url: "https://docs.python.org/3/tutorial/", type: "tutorial" },
    { name: "JavaScript.info", url: "https://javascript.info/", type: "tutorial" },
    { name: "The Modern JavaScript Tutorial", url: "https://javascript.info/", type: "tutorial" },
    { name: "Ruby Documentation", url: "https://ruby-doc.org/", type: "documentation" },
    { name: "Shell Scripting Tutorial", url: "https://www.shellscript.sh/", type: "tutorial" }
  ],
  "internet of things": [
    { name: "Introduction to IoT by Cisco", url: "https://www.netacad.com/courses/iot/introduction-iot", type: "course" },
    { name: "IoT Engineering Curriculum by AWS", url: "https://www.aws.training/Details/Curriculum?id=42335", type: "course" },
    { name: "edX IoT MicroMasters", url: "https://www.edx.org/micromasters/curtinx-internet-of-things-iot", type: "course" },
    { name: "Arduino Project Hub", url: "https://create.arduino.cc/projecthub", type: "projects" },
    { name: "Raspberry Pi Projects", url: "https://projects.raspberrypi.org/en", type: "projects" }
  ],
  "environmental science": [
    { name: "NPTEL Environmental Science", url: "https://nptel.ac.in/courses/120/107/120107022/", type: "course" },
    { name: "NASA Climate Change Resources", url: "https://climate.nasa.gov/resources/education/", type: "resource" },
    { name: "Environmental Science Open Textbook", url: "https://openstax.org/details/books/environmental-science", type: "textbook" },
    { name: "National Geographic Environment Resources", url: "https://www.nationalgeographic.org/topics/resource-library-environment/", type: "resource" },
    { name: "Environmental Protection Agency Learning Resources", url: "https://www.epa.gov/students", type: "resource" }
  ],
  "iomp": [
    { name: "MATLAB Academy", url: "https://matlabacademy.mathworks.com/", type: "interactive" },
    { name: "Introduction to Operations Management (Coursera)", url: "https://www.coursera.org/learn/wharton-operations", type: "course" },
    { name: "Operations Research by NPTEL", url: "https://nptel.ac.in/courses/110/106/110106062/", type: "course" },
    { name: "Industrial Engineering Tools", url: "https://www.isixsigma.com/tools-templates/", type: "tool" },
    { name: "PMI Learning", url: "https://www.pmi.org/learning", type: "resource" }
  ],
  programming: [
    { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", type: "interactive" },
    { name: "LeetCode", url: "https://leetcode.com/", type: "practice" },
    { name: "GitHub Learning Lab", url: "https://lab.github.com/", type: "interactive" },
    { name: "HackerRank", url: "https://www.hackerrank.com/", type: "practice" },
    { name: "Codecademy", url: "https://www.codecademy.com/", type: "interactive" }
  ],
  "data structures": [
    { name: "VisuAlgo - Visualizing Algorithms", url: "https://visualgo.net/", type: "interactive" },
    { name: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/data-structures/", type: "tutorial" },
    { name: "Open DSA", url: "https://opendsa-server.cs.vt.edu/", type: "interactive" },
    { name: "CS50's Introduction to Data Structures", url: "https://cs50.harvard.edu/x/2023/", type: "course" },
    { name: "Algorithm Visualizer", url: "https://algorithm-visualizer.org/", type: "tool" }
  ],
  general: [
    { name: "Coursera", url: "https://www.coursera.org/", type: "course" },
    { name: "edX", url: "https://www.edx.org/", type: "course" },
    { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", type: "course" },
    { name: "Khan Academy", url: "https://www.khanacademy.org/", type: "interactive" },
    { name: "TED-Ed", url: "https://ed.ted.com/", type: "video" }
  ]
};

// Add subject keywords to support better matching with student subjects
const subjectKeywords = {
  math: ['math', 'algebra', 'calculus', 'geometry', 'statistics', 'probability', 'equation'],
  physics: ['physics', 'mechanics', 'force', 'motion', 'energy', 'quantum', 'relativity'],
  chemistry: ['chemistry', 'molecule', 'atom', 'compound', 'reaction', 'acid', 'base', 'element', 'periodic table'],
  biology: ['biology', 'cell', 'gene', 'dna', 'evolution', 'ecosystem', 'organism'],
  "machine learning": ['machine learning', 'ml', 'neural network', 'deep learning', 'model', 'training', 'dataset', 'supervised', 'unsupervised', 'classification', 'regression'],
  "artificial intelligence": ['artificial intelligence', 'ai', 'intelligent agent', 'reasoning', 'knowledge representation', 'planning', 'natural language', 'nlp', 'computer vision'],
  "formal languages": ['formal languages', 'automata theory', 'language', 'grammar', 'turing machine', 'computation', 'finite automaton', 'regex', 'regular expression', 'context free'],
  "scripting languages": ['scripting', 'script', 'python', 'javascript', 'js', 'perl', 'shell', 'bash', 'powershell', 'ruby'],
  "internet of things": ['iot', 'internet of things', 'embedded system', 'sensor', 'arduino', 'raspberry pi', 'mqtt', 'connected device', 'smart home', 'smart device'],
  "environmental science": ['environmental', 'environment', 'ecology', 'ecosystem', 'sustainability', 'pollution', 'climate', 'biodiversity', 'conservation'],
  "iomp": ['iomp', 'operations management', 'industrial organization', 'optimization', 'process management', 'project management', 'inventory', 'quality control'],
  "data structures": ['data structure', 'algorithm', 'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'sort', 'search', 'binary'],
  programming: ['programming', 'code', 'algorithm', 'function', 'variable', 'javascript', 'python', 'java', 'c++', 'development'],
  general: ['study', 'learn', 'education', 'course', 'university', 'college', 'academic']
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // This matches Tailwind's indigo-600 which is commonly used as primary-600
      light: '#818CF8', // indigo-400
      dark: '#4338CA', // indigo-700
    },
    secondary: {
      main: '#10B981', // emerald-500
    },
    error: {
      main: '#EF4444', // red-500
    },
    background: {
      default: '#F9FAFB', // gray-50
    }
  },
});

// Demo responses for when no API key is available
function getDemoResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Programming-related questions
  if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
    return "JavaScript is a versatile programming language primarily used for web development. It allows you to add interactivity to websites through functions, manipulate the DOM, and create dynamic content. If you're learning JavaScript, I recommend checking out resources like [Resource #1] MDN Web Docs or [Resource #2] JavaScript.info for comprehensive tutorials.";
  }
  
  if (lowerMessage.includes('python')) {
    return "Python is known for its readability and simplicity, making it a great first programming language. It's widely used in data science, AI, web development, and automation. For learning Python, I recommend [Resource #1] the official Python documentation or [Resource #2] Real Python tutorials which provide hands-on exercises.";
  }
  
  if (lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
    return "Understanding algorithms and data structures is fundamental to computer science. Algorithms are step-by-step procedures for calculations, while data structures organize and store data efficiently. I recommend [Resource #1] VisuAlgo for visualizing algorithms and [Resource #2] GeeksforGeeks for detailed explanations and examples.";
  }
  
  // Math-related questions
  if (lowerMessage.includes('calculus') || lowerMessage.includes('derivative') || lowerMessage.includes('integral')) {
    return "Calculus deals with rates of change and accumulation. Derivatives represent rates of change (like velocity), while integrals represent accumulation (like distance traveled). For visual understanding, I recommend [Resource #1] Khan Academy's calculus course, which breaks down complex concepts into digestible videos.";
  }
  
  // General study questions
  if (lowerMessage.includes('how to study') || lowerMessage.includes('study tips')) {
    return "Effective studying involves active engagement rather than passive reading. Try techniques like:\n\n1. **Spaced repetition**: Review material at increasing intervals\n2. **Active recall**: Test yourself instead of just rereading\n3. **The Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break\n4. **Teach concepts**: Explaining to others reinforces your understanding\n\nThe [Resource #1] Learning How to Learn course on Coursera provides excellent evidence-based study techniques.";
  }
  
  // Default response
  return "I'm here to help with your engineering studies! Feel free to ask about specific concepts, programming languages, mathematical problems, or study strategies. I can also recommend learning resources tailored to your interests.";
}

// Helper function to convert plain URLs to clickable markdown links
function makeLinksClickable(text) {
  if (!text) return '';
  
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Replace plain URLs with markdown links if they're not already in markdown format
  return text.replace(urlRegex, (url) => {
    // Check if URL is already part of a markdown link: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    const prevAndNextChars = text.substring(Math.max(0, text.indexOf(url) - 10), 
                                          Math.min(text.length, text.indexOf(url) + url.length + 10));
    
    if (markdownLinkRegex.test(prevAndNextChars)) {
      return url; // Already in a markdown link, don't modify
    }
    
    // Create a markdown link
    return `[${url}](${url})`;
  });
}

// Add this function to process resource references

// Process resource references like [Resource #1] to make them clickable
function processResourceReferences(text, resources) {
  if (!text || !resources || resources.length === 0) return text;
  
  const resourceRegex = /\[Resource #(\d+)\]/g;
  
  return text.replace(resourceRegex, (match, resourceNum) => {
    const index = parseInt(resourceNum, 10) - 1;
    if (index >= 0 && index < resources.length) {
      const resource = resources[index];
      return `[${match}](${resource.url})`;
    }
    return match;
  });
}

function AIAssistantChat() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageGroups, setMessageGroups] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [resourceCategories, setResourceCategories] = useState([]);
  const [isUsingDemoMode, setIsUsingDemoMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  
  // Extract subject keywords from conversation to recommend resources
  const analyzeConversationForSubjects = (messages) => {
    if (!messages || messages.length === 0) return;
    
    // Count subject mentions
    const subjectCounts = {};
    
    // First, prioritize student's own subjects from profile
    if (studentInfo && studentInfo.subjects && studentInfo.subjects.length > 0) {
      studentInfo.subjects.forEach(subject => {
        // Convert subject name to lowercase for matching
        const subjectLower = subject.name.toLowerCase();
        
        // Try to find exact matches first
        if (EDUCATIONAL_RESOURCES[subjectLower]) {
          subjectCounts[subjectLower] = (subjectCounts[subjectLower] || 0) + 10; // Highest priority for exact matches
          return;
        }
        
        // Engineering-specific mappings for common abbreviations and course names
        const engineeringMappings = {
          'machine learning': ['ml', 'machine learning'],
          'artificial intelligence': ['ai', 'artificial intelligence'],
          'formal languages and automata theory': ['formal languages', 'automata theory', 'theory of computation'],
          'scripting languages': ['scripting', 'scripting languages'],
          'fundamentals of internet of things': ['iot', 'internet of things'],
          'environmental science': ['environmental science', 'environment'],
          'iomp': ['iomp', 'operations management', 'industrial organization']
        };
        
        // Check if the subject matches any of our engineering mappings
        for (const [category, aliases] of Object.entries(engineeringMappings)) {
          if (aliases.some(alias => subjectLower.includes(alias) || alias.includes(subjectLower))) {
            // Use the category as key if it's in our resources
            const resourceKey = EDUCATIONAL_RESOURCES[category] ? category : 
                               EDUCATIONAL_RESOURCES[category.split(' ')[0]] ? category.split(' ')[0] : null;
            
            if (resourceKey) {
              subjectCounts[resourceKey] = (subjectCounts[resourceKey] || 0) + 5; // Medium priority for engineering mappings
            }
          }
        }
      });
    }
    
    // Then, analyze the content of the messages for keyword matching
    messages.forEach(message => {
      // Check if the message content exists
      const messageText = message.content || message.text || ''; // <-- Fix: handle both content and text fields
      
      // Simple keyword matching for subject identification
      for (const [subject, keywords] of Object.entries(subjectKeywords)) {
        if (keywords.some(keyword => messageText.toLowerCase().includes(keyword))) {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        }
      }
    });
    
    // Sort subjects by popularity
    const sortedSubjects = Object.keys(subjectCounts).sort((a, b) => subjectCounts[b] - subjectCounts[a]);
    
    // Recommend resources for the top 3 subjects
    const topSubjects = sortedSubjects.slice(0, 3);
    const resourcesToRecommend = topSubjects.reduce((acc, subject) => {
      const resources = EDUCATIONAL_RESOURCES[subject] || [];
      return acc.concat(resources);
    }, []);
    
    setRecommendedResources(resourcesToRecommend);
    setResourceCategories(topSubjects);
  };
  
  // Send a message
  const sendMessage = async (overrideText) => {
    const text = overrideText || newMessage.trim();
    if (!text) return;
    
    setLoading(true);
    
    try {
      // Add user message to chat
      const messageData = {
        role: 'user',
        content: text,
        timestamp: serverTimestamp()
      };
      
      const userMessageRef = await addDoc(collection(db, 'chats', currentUser.uid, 'messages'), messageData);
      
      // Add a temporary AI message that will be updated
      const tempAiMessageData = {
        role: 'ai',
        content: "Thinking...",
        timestamp: serverTimestamp()
      };
      
      const aiMessageRef = await addDoc(collection(db, 'chats', currentUser.uid, 'messages'), tempAiMessageData);
      
      // Refresh chat history to show the user message and thinking state
      await fetchChatHistory();
      
      // Clear input
      setNewMessage('');

      try {
        // Prepare message history for the API
        const messageHistory = messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }));
        
        // Add the new user message
        messageHistory.push({ role: 'user', content: text });
        
        // Add engineering student context
        let systemPrompt = "You are an AI mentor for engineering students. ";
        
        if (studentInfo) {
          systemPrompt += `The student's name is ${studentInfo.name || 'unknown'}. `;
          
          if (studentInfo.subjects && studentInfo.subjects.length > 0) {
            systemPrompt += `They are studying: ${studentInfo.subjects.map(s => s.name).join(', ')}. `;
            systemPrompt += `Focus on these subjects when relevant, using proper technical terminology. `;
          }
        }
        
        // Add resources recommendation capability
        systemPrompt += "You can recommend educational resources that might help the student learn more about the topics discussed.";
        
        // Add system message at the beginning
        messageHistory.unshift({ 
          role: 'system', 
          content: systemPrompt
        });
        
        let responseText;
        
        // Check if we have a valid API key
        if (API_KEY) {
          try {
            // Call Groq API directly via REST instead of the SDK
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
              },
              body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: 1024
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const responseData = await response.json();
            responseText = responseData.choices[0].message.content;
          } catch (apiError) {
            console.error("API Error:", apiError);
            responseText = "I'm sorry, I encountered an error processing your request. " +
                           "Let me try to help with what I know:\n\n" + getDemoResponse(text);
          }
        } else {
          // Use demo response
          responseText = getDemoResponse(text);
        }
        
        // Update the AI message in the database
        await updateDoc(aiMessageRef, {
          content: responseText
        });
        
        // Refresh chat history to show the updated AI response
        await fetchChatHistory();
        
      } catch (apiError) {
        console.error("API Error:", apiError);
        
        // Update the AI message with error info
        await updateDoc(aiMessageRef, {
          content: "I'm sorry, I encountered an error while processing your request. Please try again later."
        });
        
        // Refresh chat to show the error message
        await fetchChatHistory();
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      
      // Scroll to bottom of chat
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Fetch chat history
  const fetchChatHistory = async () => {
    setLoadingHistory(true);
    
    const q = query(collection(db, 'chats', currentUser.uid, 'messages'), orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const messagesData = [];
    querySnapshot.forEach((doc) => {
      messagesData.push({ id: doc.id, ...doc.data() });
    });
    
    setMessages(messagesData);
    setLoadingHistory(false);
    
    // Add setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Fetch student info
  const fetchStudentInfo = async () => {
    if (!currentUser?.uid) return;
    
    const docRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setStudentInfo(docSnap.data());
    } else {
      console.log('No such document!');
    }
  };
  
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // useEffect to fetch data on mount
  useEffect(() => {
    fetchChatHistory();
    fetchStudentInfo();
  }, [currentUser]);
  
  // useEffect to analyze conversation and recommend resources
  useEffect(() => {
    analyzeConversationForSubjects(messages);
  }, [messages, studentInfo]);
  
  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const lastMessage = chatContainerRef.current.lastElementChild;
      lastMessage?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Apply necessary styles for the component
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .bg-primary-600 {
        background-color: var(--color-primary-600, #4F46E5);
      }
      .text-primary-800 {
        color: var(--color-primary-800, #3730A3);
      }
      .bg-primary-100 {
        background-color: var(--color-primary-100, #E0E7FF);
      }
      .ring-primary-500 {
        --tw-ring-color: var(--color-primary-500, #6366F1);
      }
      .border-primary-500 {
        border-color: var(--color-primary-500, #6366F1);
      }
      .bg-primary-700 {
        background-color: var(--color-primary-700, #4338CA);
      }
      /* Additional Tailwind overrides as needed */
      
      .prose {
        max-width: 100%;
      }
      .prose p {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
      }
      .prose code {
        color: #6366F1;
        background-color: #F3F4F6;
        padding: 0.2em 0.4em;
        border-radius: 0.2em;
      }
      .prose pre {
        background-color: #1F2937;
        color: #F9FAFB;
        padding: 1em;
        border-radius: 0.5em;
        overflow-x: auto;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Add this to your useEffect section to check if the API key is loaded
  useEffect(() => {
    // Check if API key is available (don't log the full key in production)
    if (!API_KEY || API_KEY === "MENTOR_AI") {
      console.warn("API key not found or using default value. Chat functionality will be limited.");
      setError("API key not configured. Please contact the administrator.");
    }
  }, []);
  
  // Add this console log at the start of your return statement to debug
  useEffect(() => {
    console.log("Resource categories:", resourceCategories);
    console.log("Recommended resources:", recommendedResources);
  }, [resourceCategories, recommendedResources]);
  
  // Add this useEffect after component declaration if it's not already there
  useEffect(() => {
    // Set default resources when component mounts
    if (!recommendedResources || recommendedResources.length === 0) {
      console.log("Setting default resources");
      setResourceCategories(['programming', 'data structures', 'general']);
      setRecommendedResources([
        ...EDUCATIONAL_RESOURCES['programming'].slice(0, 2),
        ...EDUCATIONAL_RESOURCES['data structures'].slice(0, 2),
        ...EDUCATIONAL_RESOURCES['general'].slice(0, 2)
      ]);
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Check if API key is valid - more thorough check
  useEffect(() => {
    const checkApiKey = () => {
      // Check if API key is valid - more thorough check
      const isValidKey = API_KEY && 
                        typeof API_KEY === 'string' &&
                        API_KEY.length > 10 &&
                        API_KEY !== "MENTOR_AI" && 
                        API_KEY !== "your-groq-api-key" &&
                        API_KEY !== "demo-mode";
      
      setIsUsingDemoMode(!isValidKey);
      
      if (!isValidKey) {
        console.warn("No valid API key provided, using demo mode");
        setError("AI Assistant is running in demo mode with sample responses.");
        return;
      }
      
      // Initialize Groq client
      try {
        const client = new Groq({ 
          apiKey: API_KEY, 
          dangerouslyAllowBrowser: true 
        });
      } catch (err) {
        console.error("Failed to initialize API client:", err);
        setError("Could not initialize AI Assistant. Please try again later.");
      }
    };
    
    // Make sure the component is mounted before running this code
    checkApiKey();
  }, []); // Keep the empty dependency array
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="bg-gray-100 min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="max-w-5xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <AIIcon className="mr-2" />
              <h2 className="text-xl font-bold">AI Assistant Chat</h2>
            </div>
            {/* Add this demo mode indicator */}
            {!API_KEY && (
              <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded">
                Demo Mode (No API Key)
              </div>
            )}
          </div>
          
          {/* Chat Messages */}
          <div className="flex flex-row h-[70vh]">
            {/* Messages Area - adjust flex settings to give more space to resources */}
            <div className="flex-grow flex flex-col p-4 overflow-y-auto" style={{ flexBasis: '70%', maxWidth: '70%' }}>
              {loadingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Loading conversation history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <AIIcon style={{ fontSize: 64, color: '#6366F1', marginBottom: '1rem' }} />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">AI Mentor</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Ask me questions about your coursework, get explanations for concepts, or request study resources.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user' 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                      >
                        {message.role !== 'user' && (
                          <div className="flex items-center mb-1">
                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center mr-2">
                              <AIIcon style={{ color: 'white', fontSize: '14px' }} />
                            </div>
                            <span className="font-medium text-xs text-gray-500">AI Mentor</span>
                          </div>
                        )}
                        <div className="prose max-w-none">
                          {message.content ? (
                            <ReactMarkdown
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                              components={{
                                a: ({node, ...props}) => (
                                  <a 
                                    {...props} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  />
                                )
                              }}
                            >
                              {/* Process URLs in plain text that aren't already markdown links */}
                              {makeLinksClickable(processResourceReferences(message.content, recommendedResources))}
                            </ReactMarkdown>
                          ) : (
                            <p>No content available</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">
                          {message.timestamp ? formatTime(message.timestamp) : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Resources Sidebar - remove hidden class, add fixed width and stronger styling */}
            <div className="w-80 border-l border-gray-200 p-4 overflow-y-auto bg-gray-50" style={{ flexBasis: '30%', minWidth: '250px' }}>
              <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-4 border-b pb-2">Learning Resources</h3>
              
              {recommendedResources && recommendedResources.length > 0 ? (
                <div className="space-y-4">
                  {resourceCategories && resourceCategories.map((category, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 bg-gray-100 p-1 rounded">
                        {category}
                      </h4>
                      <ul className="space-y-2">
                        {recommendedResources
                          .filter(resource => 
                            EDUCATIONAL_RESOURCES[category]?.some(r => r.url === resource.url)
                          )
                          .slice(0, 3)
                          .map((resource, rIndex) => (
                            <li key={rIndex} className="bg-white rounded-md p-2 hover:bg-gray-100 transition-colors border border-gray-200">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-700 hover:text-blue-600 hover:underline"
                              >
                                {resource.type === 'video' && <VideoIcon sx={{ fontSize: 16, marginRight: '6px' }} />}
                                {resource.type === 'interactive' && <QAIcon sx={{ fontSize: 16, marginRight: '6px' }} />}
                                {(resource.type === 'book' || resource.type === 'textbook') && <ResourceIcon sx={{ fontSize: 16, marginRight: '6px' }} />}
                                {resource.type === 'tool' && <AssignmentIcon sx={{ fontSize: 16, marginRight: '6px' }} />}
                                {!['video', 'interactive', 'book', 'textbook', 'tool'].includes(resource.type) && 
                                  <LinkIcon sx={{ fontSize: 16, marginRight: '6px' }} />}
                                <span className="text-sm">{resource.name}</span>
                              </a>
                              <div className="text-xs text-gray-500 mt-1 ml-6">{resource.type}</div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <SchoolIcon sx={{ fontSize: 36, margin: '0 auto', color: '#6366F1' }} />
                  <p className="mt-2 text-sm">Start a conversation to see recommended resources</p>
                  
                  {/* Make button more prominent */}
                  <button 
                    onClick={() => {
                      setResourceCategories(['programming', 'general', 'data structures']);
                      setRecommendedResources([
                        ...EDUCATIONAL_RESOURCES['programming'].slice(0, 2),
                        ...EDUCATIONAL_RESOURCES['general'].slice(0, 2),
                        ...EDUCATIONAL_RESOURCES['data structures'].slice(0, 2)
                      ]);
                    }}
                    className="mt-3 px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                  >
                    Show suggested resources
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Input - Enhanced Styling */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end max-w-4xl mx-auto">
              <div className="flex-grow relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask your question..."
                  className="w-full rounded-lg border-2 border-gray-200 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all min-h-[60px] resize-none"
                  rows={2}
                  style={{ fontSize: '16px' }}
                />
                <div className="text-xs text-gray-400 mt-1 ml-2">
                  Press Shift+Enter for a new line
                </div>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !newMessage.trim()}
                className={`ml-3 px-5 rounded-lg flex items-center justify-center transition-all ${
                  !loading && newMessage.trim() 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ 
                  minWidth: '100px', 
                  height: '60px',  // Match height with textarea
                  alignSelf: 'flex-start', // Align with top of textarea
                  marginTop: '0'  // Remove any margin
                }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Send</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default AIAssistantChat;