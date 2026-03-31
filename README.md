<div align="center">
  <img src="src/assets/merle-yellow.svg" alt="Orbilius Logo" width="200"/>
  
  # Orbilius PM
  ### Student Project Management System
  
  *A comprehensive React-based web application designed to streamline the management of student projects through a structured 5-step workflow with teacher oversight, admin certification, and approval processes.*
  
  [![Built with React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Powered by Firebase](https://img.shields.io/badge/Firebase-Backend-orange.svg)](https://firebase.google.com/)
  [![Vite](https://img.shields.io/badge/Vite-Build-purple.svg)](https://vitejs.dev/)
</div>

---

## 🚀 Quick Start

### New to Orbilius? Start Here!

1. **📖 Read**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase project setup guide
2. **📦 Install**: `pnpm install` - Install dependencies
3. **⚙️ Configure**: Copy `.env.example` to `.env` and add your Firebase credentials
4. **🚀 Launch**: `pnpm dev` - Start the application

### Setup Guides

- 📖 **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase project configuration
- 🚀 **[FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md)** - Deployment guide

### Common Commands

```bash
pnpm dev                        # Start development server
pnpm build                      # Build for production
pnpm firebase:deploy            # Build and deploy everything
pnpm firebase:deploy:hosting    # Deploy frontend only
pnpm firebase:deploy:functions  # Deploy Cloud Functions only
pnpm firebase:deploy:rules      # Deploy Firestore/Storage rules
pnpm firebase:emulators         # Run Firebase emulators locally
```

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

Orbilius PM is an educational project management platform that facilitates collaboration between students, teachers, and administrators in a structured learning environment. The system guides students through a comprehensive project development process while providing teachers with tools to monitor progress, provide feedback, and approve work at each stage.

### The Problem It Solves

Traditional project management in educational settings often lacks:

- ✅ Clear structure and progression tracking
- ✅ Efficient feedback mechanisms between teachers and students
- ✅ Centralized file storage and submission systems
- ✅ Real-time progress monitoring
- ✅ Standardized approval workflows
- ✅ Administrative oversight and certification processes
- ✅ Seamless communication tools

Orbilius PM addresses these challenges by providing a digital platform that ensures accountability, transparency, and effective communication throughout the project lifecycle.

---

## ✨ Core Features

### 👨‍🎓 Student Features

- **Secure Authentication**: Sign up with teacher-provided ID for class enrollment
- **Password Reset**: Self-service password reset functionality via email
- **Project Creation**: Initialize new projects with automatic due date generation
- **5-Step Workflow**: Navigate through structured project phases
- **File Submission**: Upload PDF documents with duplicate prevention
- **Progress Tracking**: View current step status, due dates, and timeline
- **Teacher Feedback**: Receive detailed comments and revision requests
- **Resource Downloads**: Access step-specific resource PDFs

### 👩‍🏫 Teacher Features

- **Comprehensive Dashboard**: Monitor all assigned students and projects
- **Student Information**: View student names and email addresses
- **Project Oversight**: Track student progress with status indicators
- **PDF Review System**: In-browser PDF viewing with navigation controls
- **Feedback System**: Leave detailed comments for improvement
- **Approval Workflow**: Approve steps or request revisions
- **Email Integration**: Direct mailto links with pre-filled content
- **Teacher ID Management**: Easy sharing for student enrollment

### 👨‍💼 Admin Features

- **Admin Dashboard**: Comprehensive administrative control panel
- **Admin Code Management**: View and update teacher registration codes
- **Project Certification**: Review and certify completed projects
- **Teacher Management**: Add, view, and remove teachers
- **System Oversight**: Monitor all projects across the platform

### 🔧 Technical Features

- **Real-time Updates**: Instant synchronization of project status changes
- **Secure File Storage**: Firebase Storage with security rules
- **Responsive Design**: Optimized for desktop and mobile devices
- **PDF Processing**: Advanced PDF viewing with react-pdf integration
- **Multi-role Auth**: Student, teacher, and admin role management
- **Cloud Functions**: Server-side logic for admin operations and email

---

## 🏗️ System Architecture

### Frontend (React + Vite)

- **Component Structure**: Modular React components with TypeScript support
- **Routing**: React Router for seamless navigation
- **State Management**: React hooks for local and global state
- **Styling**: Material-UI (MUI) for consistent design
- **PDF Handling**: react-pdf with PDF.js for document rendering

### Backend (Firebase)

#### Services

- **Firebase Auth**: Multi-role email/password authentication
- **Cloud Firestore**: NoSQL document database for all app data
- **Firebase Storage**: File storage for submissions and resources
- **Cloud Functions**: Server-side logic (email, admin operations)
- **Firebase Hosting**: CDN-backed hosting for the frontend

#### Security

- **Firestore Rules**: Role-based access control for database documents
- **Storage Rules**: Secure file access policies
- **Cloud Functions**: Admin-privileged operations with request validation

---

## 💻 Installation

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (recommended) or npm
- **Firebase Account**: Free tier available at [firebase.google.com](https://firebase.google.com)
- **Firebase CLI**: `npm install -g firebase-tools`

### Step 1: Clone Repository

```bash
git clone https://github.com/orbilius101/Orbilius.git
cd Orbilius
```

### Step 2: Install Dependencies

```bash
pnpm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

### Step 3: Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials (from Firebase Console > Project Settings):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: The `VITE_` prefix is required for Vite to expose variables to the client.

### Step 4: Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions on configuring Firestore, Storage, and Authentication in the Firebase Console.

---

## 🚀 Development

### Start Development Server

```bash
pnpm dev
```

Access the app at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

Output directory: `dist/`

### Lint Code

```bash
pnpm lint
```

### Format Code

```bash
pnpm format
```

---

## 🌐 Deployment

### Firebase Hosting + Cloud Functions

1. Login to Firebase CLI: `firebase login`
2. Build and deploy:

```bash
pnpm firebase:deploy
```

Or deploy individually:

```bash
pnpm firebase:deploy:hosting    # Frontend only
pnpm firebase:deploy:functions  # Cloud Functions only
pnpm firebase:deploy:rules      # Firestore/Storage rules only
```

### Environment Variables for Cloud Functions

```bash
firebase functions:config:set resend.api_key="your_resend_api_key"
```

See [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md) for the full deployment guide.

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **react-pdf** - PDF viewing
- **Vite** - Build tool

### Backend

- **Firebase** - Backend as a Service
  - Cloud Firestore (NoSQL database)
  - Firebase Authentication
  - Firebase Storage
  - Cloud Functions
  - Firebase Hosting

### Development Tools

- **pnpm** - Fast package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📁 Project Structure

```
Orbilius/
├── public/
│   ├── pdf.worker.min.js          # PDF.js worker
│   └── favicons/                   # App icons
├── src/
│   ├── admin/                      # Admin components
│   │   ├── dashboard.tsx
│   │   ├── components/
│   │   └── api/
│   ├── student/                    # Student components
│   │   └── components/
│   │       ├── Dashboard/
│   │       ├── Step1-5Upload/
│   │       └── SharedComponents/
│   ├── teacher/                    # Teacher components
│   │   └── components/
│   ├── components/                 # Shared components
│   │   ├── Login/
│   │   ├── Signup/
│   │   ├── ResetPassword/
│   │   └── LandingPage/
│   ├── hooks/                      # Custom React hooks
│   ├── types/                      # TypeScript types
│   ├── utils/                      # Utility functions
│   ├── assets/                     # Images and logos
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # App entry point
│   └── firebaseConfig.ts           # Firebase config
├── functions/                      # Cloud Functions
├── firebase.json                   # Firebase project config
├── firestore.rules                 # Firestore security rules
├── storage.rules                   # Storage security rules
├── .firebaserc                     # Firebase project alias
├── package.json
├── vite.config.js
├── tsconfig.json
└── README.md
```

---

## 🔧 Troubleshooting

### Authentication Issues

**Problem**: Users can't sign up
**Solution**: Check Firebase Console > Authentication > Sign-in method > Email/Password is enabled

**Problem**: Admin code not working
**Solution**: Check `admin_code` document exists in Firestore

### Storage Issues

**Problem**: File uploads failing
**Solution**:

1. Check Firebase Storage rules allow authenticated writes
2. Verify storage bucket exists in Firebase Console
3. Check `storage.rules` file

### Cloud Functions Issues

**Problem**: Functions not responding
**Solution**:

1. Check logs: `firebase functions:log`
2. Verify environment config: `firebase functions:config:get`
3. Redeploy: `pnpm firebase:deploy:functions`

### PDF Viewing Issues

**Problem**: PDFs not loading
**Solution**:

1. Ensure `pdf.worker.min.js` exists in `public/`
2. Check file URLs are accessible
3. Verify CORS settings

### Development Setup

**Problem**: Vite not starting
**Solution**:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

**Problem**: Environment variables not loading
**Solution**:

1. Ensure `.env` file exists in root
2. Variables must start with `VITE_`
3. Restart dev server after changing `.env`

### Common Errors

| Error                           | Solution                                    |
| ------------------------------- | ------------------------------------------- |
| `Missing Firebase config`       | Check `.env` has all `VITE_FIREBASE_*` vars |
| `Permission denied`             | Check Firestore/Storage security rules      |
| `Functions deployment failed`   | Run `cd functions && npm install`           |
| `PDF worker not found`          | Copy `pdf.worker.min.js` to `public/`       |

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/orbilius101/Orbilius/issues)
- **Discussions**: [GitHub Discussions](https://github.com/orbilius101/Orbilius/discussions)

---

<div align="center">
  Made with ❤️ by the Orbilius Team
</div>
