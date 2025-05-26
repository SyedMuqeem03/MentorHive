import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Menu, MenuItem, Divider, Badge, Avatar,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  useMediaQuery, useTheme, Box
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  AppRegistration as SignupIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';

function Navbar() {
  // Get context, navigation and theme data
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Track component mount status with useRef
  const isMounted = useRef(true);
  
  // Create all state variables
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // This useEffect MUST run in all render scenarios
  useEffect(() => {
    // Check if we should render the navbar based on the current path
    const isAuthPage = location.pathname === '/login' || 
                      location.pathname === '/signup' || 
                      location.pathname === '/forgot-password';
    
    // Handle scroll events for styling
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      isMounted.current = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, scrolled]);

  // Add this useEffect to listen for unread messages
  useEffect(() => {
    if (!currentUser) return;
    
    // Query for messages where the current user is a participant
    // and the message is unread (not in readBy array or read is false)
    const unreadMessagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', {
        id: currentUser.uid,
        role: currentUser.role
      }),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(unreadMessagesQuery, async (snapshot) => {
      try {
        const unreadMessages = [];
        let count = 0;
        
        // Process each message to check if it's unread
        for (const docSnap of snapshot.docs) {
          const messageData = docSnap.data();
          
          // Check if message is not sent by current user and is unread
          if (messageData.senderId !== currentUser.uid) {
            // Check if message is unread using either method (readBy array or read flag)
            const isUnread = 
              (!messageData.readBy || !messageData.readBy.includes(currentUser.uid)) && 
              (messageData.read === false || messageData.read === undefined);
              
            if (isUnread) {
              count++;
              
              // Find sender details to display in notifications
              let senderName = "Unknown User";
              let senderRole = "";
              
              // Try to get sender details from the participants array
              const sender = messageData.participants.find(p => p.id === messageData.senderId);
              
              if (sender) {
                // Look up additional user details from Firestore
                try {
                  const senderDoc = await getDoc(doc(db, `${sender.role}s`, sender.id));
                  if (senderDoc.exists()) {
                    const senderData = senderDoc.data();
                    senderName = senderData.name || senderData.displayName || senderData.fullName || "User";
                    senderRole = sender.role;
                  }
                } catch (err) {
                  console.error('Error fetching sender details:', err);
                }
              }
              
              // Check if this is a subject-based chat for a student
              if (currentUser.role === 'student' && messageData.subjectId && 
                  SUBJECT_TO_MENTOR_MAP[messageData.subjectId]) {
                const mentorInfo = SUBJECT_TO_MENTOR_MAP[messageData.subjectId];
                senderName = mentorInfo.name;
                senderRole = 'mentor';
              }
              
              // Add to unread messages array for notifications
              unreadMessages.push({
                id: docSnap.id,
                text: messageData.text,
                time: messageData.timestamp?.toDate() || new Date(),
                senderName,
                senderRole,
                subject: messageData.subject || '',
                chatId: messageData.subjectId || messageData.senderId
              });
            }
          }
        }
        
        setUnreadMessages(count);
        setNotifications(unreadMessages);
        console.log(`Found ${count} unread messages for ${currentUser.uid}`);
      } catch (err) {
        console.error('Error checking for unread messages:', err);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser]);
  
  // Define handlers AFTER all hooks have been called
  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
      handleProfileMenuClose();
      await logout();
      // Force reload to clear any component state
      window.location.href = '/login';
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  // Check if we should render the navbar based on the current path
  const isAuthPage = location.pathname === '/login' || 
                    location.pathname === '/signup' || 
                    location.pathname === '/forgot-password';
  
  // Create navigation links based on user role
  const navLinks = [
    { text: 'Dashboard', path: currentUser?.role === 'student' ? '/student-home' : '/mentor-home', icon: <DashboardIcon /> },
  ];
  
  // Add role-specific navigation items
  if (currentUser?.role === 'student') {
    navLinks.push({ text: 'Mentors', path: '/mentors', icon: <SchoolIcon /> });
    navLinks.push({ 
      text: 'Chat', 
      path: '/chat', 
      icon: <MessageIcon />, 
      badge: unreadMessages // Use unreadMessages count here
    });
    // Add AI Mentor link for students
    navLinks.push({ 
      text: 'AI Mentor', 
      path: '/ai-mentor', 
      icon: <AIIcon />, 
      highlight: true // Optional: to style it differently
    });
  } else if (currentUser?.role === 'mentor') {
    navLinks.push({ text: 'Students', path: '/students', icon: <SchoolIcon /> });
    navLinks.push({ 
      text: 'Messages', 
      path: '/chat', 
      icon: <MessageIcon />, 
      badge: unreadMessages // Use unreadMessages count here for mentors too
    });
  }

  // Early returns AFTER all hooks have been called
  if (isAuthPage) return null;
  if (loading) return null;
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: scrolled ? 'white' : '#1e40af',
        color: scrolled ? 'inherit' : 'white',
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and brand */}
        <div className="flex items-center">
          {isMobile && (
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ 
                mr: 2,
                color: scrolled ? 'text.primary' : 'white',
                bgcolor: scrolled ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: scrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Link to="/" className="flex items-center">
            <div className={`h-10 w-10 ${scrolled ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-white'} rounded-lg flex items-center justify-center ${scrolled ? 'text-white' : 'text-blue-700'} mr-3 transition-all duration-300`}>
              <SchoolIcon fontSize="small" />
            </div>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: scrolled ? 'linear-gradient(to right, #2563eb, #4f46e5)' : 'white',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: scrolled ? 'transparent' : 'white',
                display: { xs: 'none', sm: 'block' },
                transition: 'all 0.3s ease'
              }}
            >
              Mentoring Portal
            </Typography>
          </Link>
        </div>

        {/* Navigation Links (desktop) */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link key={link.text} to={link.path}>
                <Button 
                  color="inherit"
                  startIcon={
                    link.badge ? (
                      <Badge badgeContent={link.badge} color="error">
                        {link.icon}
                      </Badge>
                    ) : link.icon
                  }
                  sx={{ 
                    mx: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    padding: '6px 12px',
                    color: scrolled 
                      ? (location.pathname === link.path ? 'primary.main' : '#4b5563') 
                      : (location.pathname === link.path ? '#ffffff' : '#bfdbfe'),
                    backgroundColor: location.pathname === link.path 
                      ? (scrolled ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.1)')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.15)'
                    },
                    // Special styling for AI Mentor
                    ...(link.highlight && {
                      background: scrolled 
                        ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
                        : 'rgba(255, 255, 255, 0.2)',
                      color: scrolled ? 'white' : '#ffffff',
                      '&:hover': {
                        background: scrolled 
                          ? 'linear-gradient(45deg, #4f46e5, #7c3aed)'
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      boxShadow: scrolled 
                        ? '0 2px 4px rgba(0,0,0,0.1)'
                        : '0 2px 4px rgba(0,0,0,0.05)',
                    }),
                    transition: 'all 0.2s ease'
                  }}
                >
                  {link.text}
                </Button>
              </Link>
            ))}
          </Box>
        )}

        {/* Right side items (notifications, profile) */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentUser ? (
            <>
              <IconButton 
                color={scrolled ? "default" : "inherit"} 
                onClick={handleNotificationsOpen}
                sx={{ 
                  mr: 1,
                  bgcolor: scrolled ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: scrolled ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <div 
                onClick={handleProfileMenuOpen}
                className={`flex items-center space-x-2 cursor-pointer py-1 px-2 rounded-lg ${
                  scrolled ? 'hover:bg-gray-100' : 'hover:bg-blue-700'
                } transition-colors duration-200`}
              >
                <Avatar 
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    bgcolor: scrolled ? 'primary.main' : 'white',
                    color: scrolled ? 'white' : 'primary.main',
                    border: scrolled ? 'none' : '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                {!isMobile && (
                  <div>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500, 
                        lineHeight: 1.2,
                        color: scrolled ? 'text.primary' : 'white' 
                      }}
                    >
                      {currentUser.email}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: scrolled ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)' 
                      }}
                    >
                      {currentUser.role === 'student' ? 'Student' : 'Mentor'}
                    </Typography>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button 
                  variant={scrolled ? "outlined" : "outlined"}
                  color={scrolled ? "primary" : "inherit"}
                  startIcon={<LoginIcon />}
                  sx={{ 
                    mr: 1,
                    textTransform: 'none', 
                    fontWeight: 500,
                    borderColor: scrolled ? 'primary.main' : 'white',
                    color: scrolled ? 'primary.main' : 'white',
                    '&:hover': {
                      borderColor: scrolled ? 'primary.dark' : 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: scrolled ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SignupIcon />}
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 500,
                    borderRadius: '8px',
                    background: scrolled 
                      ? 'linear-gradient(to right, #2563eb, #4f46e5)'
                      : 'white',
                    color: scrolled ? 'white' : '#1e40af',
                    boxShadow: scrolled 
                      ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      background: scrolled
                        ? 'linear-gradient(to right, #1d4ed8, #4338ca)'
                        : '#f9fafb',
                      boxShadow: scrolled
                        ? '0 6px 10px -1px rgba(37, 99, 235, 0.4)'
                        : '0 6px 10px -1px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: 280,
            p: 0
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI Mentor
          </Typography>
          <IconButton onClick={toggleMobileMenu}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {navLinks.map((link) => (
            <ListItem 
              button 
              component={Link} 
              to={link.path}
              key={link.text}
              onClick={toggleMobileMenu}
              sx={{ 
                borderRadius: '8px',
                mb: 0.5,
                ...(location.pathname === link.path && {
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                }),
                ...(link.highlight && {
                  background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                  }
                })
              }}
            >
              <ListItemIcon sx={{
                minWidth: 40,
                color: link.highlight ? 'white' : (location.pathname === link.path ? 'primary.main' : 'inherit')
              }}>
                {link.badge ? (
                  <Badge badgeContent={link.badge} color="error">
                    {link.icon}
                  </Badge>
                ) : link.icon}
              </ListItemIcon>
              <ListItemText 
                primary={link.text} 
                primaryTypographyProps={{
                  sx: {
                    fontWeight: location.pathname === link.path ? 600 : 400
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 220,
            '& .MuiList-root': {
              p: 1
            }
          }
        }}
      >
        {/* Profile menu items */}
        <MenuItem 
          component={Link} 
          to="/profile"
          onClick={handleProfileMenuClose}
          sx={{ 
            borderRadius: '8px',
            mb: 0.5
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        
        <MenuItem 
          component={Link} 
          to="/settings"
          onClick={handleProfileMenuClose}
          sx={{ 
            borderRadius: '8px',
            mb: 0.5
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            borderRadius: '8px',
            color: 'error.main'
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography>
          {notifications.length > 0 && (
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={() => {
              // Mark all as read functionality would go here
              handleNotificationsClose();
              navigate('/chat');
            }}>
              Mark all as read
            </Typography>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => {
                  handleNotificationsClose();
                  navigate(`/chat/${notification.chatId}`);
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: notification.senderRole === 'mentor' ? 'primary.main' : 'secondary.main',
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    {notification.senderName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {notification.senderName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.time)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                      {notification.text}
                    </Typography>
                    {notification.subject && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        Subject: {notification.subject}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
            
            {notifications.length > 0 && (
              <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => {
                    handleNotificationsClose();
                    navigate('/chat');
                  }}
                >
                  View all messages
                </Button>
              </Box>
            )}
          </List>
        )}
      </Menu>
    </AppBar>
  );
}

// Add this helper function to format message timestamps
const formatTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const timeDiff = now - date;
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  if (dayDiff === 0) {
    // Today - show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (dayDiff === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (dayDiff < 7) {
    // Show day name
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    // Show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default Navbar;