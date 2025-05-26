// Centralize your app configuration
export const appConfig = {
  appName: 'Mentoring Portal',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  },
  routes: {
    home: '/',
    login: '/login',
    signup: '/signup',
    studentHome: '/student-home',
    mentorHome: '/mentor-home',
    studentForm: '/student-form',
    chat: '/chat',
  },
  defaultAvatar: '/assets/default-avatar.png',
}