# MentorHive

<div align="center">
  <img src="public/mentoring-icon.svg" alt="MentorHive Logo" width="100" height="100">
  <h3>Connecting Students with Mentors for Academic Excellence</h3>
</div>

## 🚀 Overview

MentorHive is a platform connecting students with experienced mentors across various domains, facilitating personalized learning experiences through seamless communication and resource sharing.

MentorHive is an interactive web platform for student mentorship. The platform allows students to register or log in, select their current academic year and semester, and then choose specific subjects they are struggling with. Based on this input, the system matches the student with a mentor from a predefined mentor database.

The mentor's role is to guide, support, and communicate with the student regarding those subjects. If the mentor is offline or unavailable, an AI assistant automatically follows up with the student, answers basic questions, and maintains engagement.

The overall goal is to create a personalized academic support system that blends human mentorship with AI assistance.

## ✨ Features

- **User Authentication System**: Secure login and registration for mentors and students
- **Profile Management**: Detailed profiles for mentors highlighting expertise and achievements
- **Session Booking**: Intuitive interface for scheduling mentoring sessions
- **Real-time Chat**: Direct communication between mentors and students through an integrated messaging system. Features include:
  - Text messaging with support for attachments
  - Read receipts and typing indicators
  - Message history and search functionality
  - Group discussions for collaborative learning
  - Ability to share code snippets, documents, and learning resources
- **Resource Sharing**: Platform for sharing educational materials and resources
- **AI Mentor**: Intelligent virtual mentor powered by advanced algorithms that:
  - Provides 24/7 support when human mentors are offline
  - Answers common questions across various subjects
  - Offers personalized guidance based on student learning patterns
  - Recommends relevant learning resources and practice exercises
  - Maintains student engagement through regular check-ins
  - Seamlessly hands over conversations to human mentors when they become available

## 🛠️ Tech Stack

- **Frontend**: React.js, JavaScript, Vite
- **Styling**: Tailwind CSS, Material-UI
- **State Management**: React Context API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **AI Integration**: Groq API (Llama3)
- **Deployment**: Render.com

## 📋 Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Modern web browser

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SyedMuqeem03/MentorHive.git
   cd MentorHive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
MentorHive/
├── public/              # Static files
│   ├── assets/          # Images and other assets
│   └── index.html       # HTML template
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── context/         # React context providers
│   ├── utils/           # Utility functions
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── styles/          # CSS and styling files
│   ├── App.js           # Main App component
│   └── index.js         # Entry point
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=your_api_url
REACT_APP_AUTH_DOMAIN=your_auth_domain
```

## 💻 Usage

1. Register as a student or mentor
2. Complete your profile with relevant information
3. Browse available mentors (if you're a student) or set up your availability (if you're a mentor)
4. Book sessions and start your learning/mentoring journey

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License

Copyright (c) 2025 Syed Muqeem Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 👥 Team

- [Syed Muqeem Ahmed](https://github.com/SyedMuqeem03) - Lead Developer

## 🙏 Acknowledgements

- React.js documentation
- Tailwind CSS community
- All contributors and supporters

## 📞 Contact

For any questions or suggestions, please reach out to:
- GitHub: [@SyedMuqeem03](https://github.com/SyedMuqeem03)
- Email: [smuqeem03@gmail.com]

---

Made with ❤️ by Syed Muqeem Ahmed