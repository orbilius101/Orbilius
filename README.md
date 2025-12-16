<div align="center">
  <img src="src/assets/merle-yellow.svg" alt="Orbilius Logo" width="200"/>
  
  # Orbilius PM
  ### Student Project Management System
  
  *A comprehensive React-based web application designed to streamline the management of student projects through a structured 5-step workflow with teacher oversight, admin certification, and approval processes.*
  
  [![Built with React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Powered by Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-Build-purple.svg)](https://vitejs.dev/)
</div>

---

## 🚀 Quick Start

### New to Orbilius? Start Here!

Setting up a new Supabase project is fast and automated:

1. **📖 Read**: [QUICK_SETUP.md](./QUICK_SETUP.md) - Streamlined 5-step guide (10 minutes)
2. **⚙️ Run**: `pnpm run setup` - Interactive setup wizard
3. **✅ Verify**: `pnpm run verify:setup` - Check your configuration
4. **🚀 Launch**: `pnpm dev` - Start the application

### Setup Guides

Choose the guide that fits your needs:

- 📖 **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Fast 5-step setup (recommended for new users)
- 📚 **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed walkthrough with explanations
- ☑️ **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Interactive checklist format
- 📋 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Overview of all setup resources

### Automated Setup Commands

```bash
pnpm setup              # Interactive setup wizard
pnpm verify:setup       # Verify your configuration
pnpm dev                # Start development server
pnpm build              # Build for production
```

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Database Setup](#database-setup)
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
- **Secure File Storage**: Supabase Storage with Row Level Security (RLS)
- **Responsive Design**: Optimized for desktop and mobile devices
- **PDF Processing**: Advanced PDF viewing with react-pdf integration
- **Multi-role Auth**: Student, teacher, and admin role management
- **Database Management**: PostgreSQL backend with automatic scaling

---

## 🏗️ System Architecture

### Frontend (React + Vite)

- **Component Structure**: Modular React components with TypeScript support
- **Routing**: React Router for seamless navigation
- **State Management**: React hooks + Supabase for global state
- **Styling**: Material-UI (MUI) for consistent design
- **PDF Handling**: react-pdf with PDF.js for document rendering

### Backend (Supabase)

#### Database Tables

- **`users`**: User profiles with role-based access (student/teacher/admin)
- **`projects`**: Project information and step tracking
- **`project_steps`**: Individual step data with teacher comments
- **`submissions`**: Legacy file submissions and feedback
- **`step_comments`**: Detailed teacher feedback system
- **`admin_code`**: Secure admin codes for teacher registration

#### Key Features

- **Authentication**: Multi-role email/password authentication
- **Storage**: Two buckets (`student-submissions`, `resources`)
- **Real-time**: Automatic updates across all user interfaces
- **Row Level Security**: Comprehensive RLS policies (27 policies)
- **Functions**: Auto-create users, delete teachers, update admin codes
- **Triggers**: Automatic timestamp updates on data changes

---

## 💻 Installation

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (recommended) or npm
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)

### Step 1: Clone Repository

```bash
git clone https://github.com/orbilius101/Orbilius.git
cd Orbilius
```

### Step 2: Install Dependencies

```bash
pnpm install
# or
npm install
```

### Step 3: Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Database Setup

**Option 1: Automated Setup (Recommended)**

```bash
pnpm setup
```

**Option 2: Manual Setup**

Run the complete schema script in your Supabase SQL Editor:

```bash
# Copy contents of sql/complete_schema.sql
# Paste into Supabase Dashboard → SQL Editor → Run
```

This creates:

- ✅ All 6 tables with correct structure
- ✅ 27 RLS policies
- ✅ 4 custom functions
- ✅ 3 automatic triggers
- ✅ All indexes for performance
- ✅ Storage buckets

### Step 5: Verify Setup

```bash
pnpm verify:setup
```

---

## 🗄️ Database Setup

Your database schema is fully defined in [sql/complete_schema.sql](sql/complete_schema.sql). This includes:

### Tables

1. **users** - User profiles with teacher-student relationships
2. **projects** - Main project tracking with all step statuses
3. **project_steps** - Individual step submissions and comments
4. **submissions** - Legacy submission tracking
5. **step_comments** - Detailed teacher feedback
6. **admin_code** - Admin access code management

### RLS Policies (27 total)

- Students can view/update their own projects
- Teachers can view/update assigned projects
- Admins can view/update all projects
- Secure storage access policies

### Functions

- `handle_new_user()` - Auto-creates user profile and initial project
- `delete_teacher()` - Removes teacher and associated students
- `update_admin_code()` - Securely updates admin codes
- `update_updated_at_column()` - Automatic timestamp updates

### Storage Buckets

- `student-submissions` (private) - Student file uploads
- `resources` (public) - Downloadable resources

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

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables

Ensure these are set in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: The `VITE_` prefix is required for Vite to expose variables to the client.

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

- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Real-time subscriptions
  - Row Level Security

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
│   └── supabaseClient.ts           # Supabase config
├── sql/                            # Database scripts
│   ├── complete_schema.sql         # Full database setup
│   ├── export_schema_sections.sql  # Schema inspection
│   └── *.sql                       # Migration scripts
├── scripts/                        # Setup automation
│   ├── setup-supabase.js
│   └── verify-setup.js
├── package.json
├── vite.config.js
├── tsconfig.json
└── README.md
```

---

## 🔧 Troubleshooting

### Database Issues

**Problem**: RLS policy errors  
**Solution**: Run [sql/complete_schema.sql](sql/complete_schema.sql) to reset all policies

**Problem**: Missing tables  
**Solution**: Use `pnpm setup` or manually run complete_schema.sql

### Authentication Issues

**Problem**: Users can't sign up  
**Solution**: Check email confirmation settings in Supabase Dashboard → Authentication → Settings

**Problem**: Admin code not working  
**Solution**: Check `admin_code` table has a valid entry

### Storage Issues

**Problem**: File uploads failing  
**Solution**:

1. Verify buckets exist: `student-submissions`, `resources`
2. Check RLS policies on storage buckets
3. Run [sql/fix_storage_policies.sql](sql/fix_storage_policies.sql)

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

| Error                       | Solution                              |
| --------------------------- | ------------------------------------- |
| `Missing VITE_SUPABASE_URL` | Add to `.env` file                    |
| `RLS policy violation`      | Check user permissions in database    |
| `Storage bucket not found`  | Create buckets in Supabase Dashboard  |
| `PDF worker not found`      | Copy `pdf.worker.min.js` to `public/` |

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
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

Orbilius PM is an educational project management platform that facilitates collaboration between students, teachers, and administrators in a structured learning environment. The system guides students through a comprehensive project development process while providing teachers with tools to monitor progress, provide feedback, and approve work at each stage. Administrators can manage system settings and certify completed projects for final submission to the Orbilius archive.

### The Problem It Solves

Traditional project management in educational settings often lacks:

- Clear structure and progression tracking
- Efficient feedback mechanisms between teachers and students
- Centralized file storage and submission systems
- Real-time progress monitoring
- Standardized approval workflows
- Administrative oversight and certification processes
- Seamless communication tools

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
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
