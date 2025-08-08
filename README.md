# Orbilius - Student Project Management System

A comprehensive React-based web application designed to streamline the management of student projects through a structured 5-step workflow with teacher oversight and approval processes. Built with modern web technologies and powered by Supabase for real-time data management and file storage.

## Project Overview

Orbilius is an educational project management platform that facilitates collaboration between students and teachers in a structured learning environment. The system guides students through a comprehensive project development process while providing teachers with tools to monitor progress, provide feedback, and approve work at each stage.

### The Problem It Solves

Traditional project management in educational settings often lacks:
- Clear structure and progression tracking
- Efficient feedback mechanisms between teachers and students
- Centralized file storage and submission systems
- Real-time progress monitoring
- Standardized approval workflows

Orbilius addresses these challenges by providing a digital platform that ensures accountability, transparency, and effective communication throughout the project lifecycle.

## Core Features

### Student Features
- **Secure Authentication**: Sign up with teacher-provided ID for class enrollment
- **Project Creation**: Initialize new projects with personal and academic details
- **5-Step Workflow**: Navigate through structured project phases:
  1. **Initial Research** - Foundation and background research
  2. **Design Brief** - Project planning and design documentation
  3. **Planning** - Detailed implementation planning
  4. **Implementation** - Active project development
  5. **Archival Records** - Final documentation and reflection
- **File Submission**: Upload PDF documents for each step
- **Progress Tracking**: View current step status and next actions
- **Teacher Feedback**: Receive comments and revision requests
- **Resubmission Capability**: Revise and resubmit work based on feedback

### Teacher Features
- **Comprehensive Dashboard**: Monitor all assigned students and projects
- **Project Oversight**: View student progress across all project phases
- **PDF Review System**: In-browser PDF viewing with navigation controls
- **Feedback System**: Leave detailed comments for student improvement
- **Approval Workflow**: Approve completed steps or request revisions
- **Student Communication**: Direct email integration for student contact
- **Teacher ID Sharing**: Easy access to unique teacher ID for student enrollment

### Technical Features
- **Real-time Updates**: Instant synchronization of project status changes
- **Secure File Storage**: Supabase Storage with Row Level Security (RLS)
- **Responsive Design**: Optimized for desktop and mobile devices
- **PDF Processing**: Advanced PDF viewing with react-pdf integration
- **Authentication & Authorization**: Secure user management with Supabase Auth
- **Database Management**: PostgreSQL backend with automatic scaling

## User Workflow

### For Students:
1. **Registration**: Sign up using teacher-provided Teacher ID
2. **Project Setup**: Create new project with personal details and project title
3. **Step-by-Step Progress**: 
   - Navigate to current step (sequential access enforced)
   - Review step requirements and guidelines
   - Upload required PDF documentation
   - Submit for teacher review
   - Receive feedback and make revisions if needed
   - Proceed to next step upon approval
4. **Completion**: Complete all 5 steps for project graduation

### For Teachers:
1. **Dashboard Access**: View all assigned student projects in one interface
2. **Progress Monitoring**: Track student progress across multiple projects
3. **Review Process**:
   - Click on submitted project titles to access review interface
   - View student-submitted PDF documents
   - Navigate through multi-page documents
   - Leave detailed feedback comments
   - Choose to approve step or request revisions
4. **Student Management**: Email students directly from the dashboard
5. **ID Distribution**: Share unique Teacher ID with students for enrollment

## System Architecture

### Frontend (React + Vite)
- **Component Structure**: Modular React components for different user interfaces
- **Routing**: React Router for seamless navigation between pages
- **State Management**: React hooks for local state and Supabase for global state
- **Styling**: Inline CSS objects for consistent, maintainable styling
- **PDF Handling**: react-pdf with PDF.js for document rendering

### Backend (Supabase)
- **Database**: PostgreSQL with the following key tables:
  - `users`: User profiles and authentication data
  - `projects`: Project information and step tracking
  - `submissions`: File submissions and teacher feedback
- **Authentication**: Email/password authentication with secure session management
- **Storage**: File upload and retrieval with signed URLs for security
- **Real-time**: Automatic updates when data changes

### Security Features
- **Row Level Security (RLS)**: Database-level access controls
- **Authenticated File Access**: Secure file storage with user-specific permissions
- **Session Management**: Automatic login state persistence and logout
- **Teacher-Student Isolation**: Students can only access their own projects

## Features

- Student login/signup and project creation
- 5-step project workflow with file submissions
- Teacher dashboard with approval system
- PDF viewing and commenting
- File upload to Supabase Storage

## Setup for Development

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone your-repo-url
   cd orbilius
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase dashboard:
   
   **users table:**
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT auth.uid(),
     email TEXT NOT NULL,
     first_name TEXT,
     last_name TEXT,
     user_type TEXT CHECK (user_type IN ('student', 'teacher')),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
   
   **projects table:**
   ```sql
   CREATE TABLE projects (
     project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     student_id UUID REFERENCES users(id),
     teacher_id UUID REFERENCES users(id),
     first_name TEXT,
     last_name TEXT,
     email TEXT,
     grade TEXT,
     project_title TEXT,
     current_step INTEGER DEFAULT 1,
     step1_status TEXT DEFAULT 'In Progress',
     step2_status TEXT DEFAULT 'Locked',
     step3_status TEXT DEFAULT 'Locked',
     step4_status TEXT DEFAULT 'Locked',
     step5_status TEXT DEFAULT 'Locked',
     step1_due_date DATE,
     step2_due_date DATE,
     step3_due_date DATE,
     step4_due_date DATE,
     step5_due_date DATE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
   
   **submissions table:**
   ```sql
   CREATE TABLE submissions (
     submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES projects(project_id),
     step_number INTEGER,
     file_url TEXT,
     teacher_comments TEXT,
     submitted_at TIMESTAMP DEFAULT NOW()
   );
   ```
   
   **Set up Storage:**
   - Create a storage bucket named `student-submissions`
   - Configure RLS policies for secure file access
   
   **Row Level Security Policies:**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
   
   -- Users can only see their own profile
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);
   
   -- Students can only see their own projects, teachers can see assigned projects
   CREATE POLICY "Project access" ON projects
     FOR SELECT USING (
       auth.uid() = student_id OR auth.uid() = teacher_id
     );
   
   -- Similar policies for submissions table
   CREATE POLICY "Submission access" ON submissions
     FOR SELECT USING (
       project_id IN (
         SELECT project_id FROM projects 
         WHERE auth.uid() = student_id OR auth.uid() = teacher_id
       )
     );
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is optimized for deployment on:
- Vercel (recommended)
- Netlify
- Any static hosting service

Remember to add your environment variables in your hosting platform's settings.

## Tech Stack
- React 19
- Vite
- Supabase
- React Router
- react-pdf
- pdfjs-dist

## Project Structure

```
orbilius/
├── public/                 # Static assets
│   ├── pdf.worker.min.js  # PDF.js worker for react-pdf
│   └── vite.svg           # Vite logo
├── src/
│   ├── assets/            # React logo and other assets
│   ├── student/           # Student-specific components
│   │   ├── dashboard.jsx  # Student project dashboard
│   │   ├── submitStep.jsx # Generic step submission component
│   │   └── step1-5/       # Individual step components
│   │       ├── stepXIndex.jsx   # Step overview pages
│   │       └── stepXUpload.jsx  # Step upload pages
│   ├── teacher/           # Teacher-specific components
│   │   ├── dashboard.jsx  # Teacher project oversight dashboard
│   │   └── stepApproval.jsx # PDF review and approval interface
│   ├── App.jsx            # Main app component with routing
│   ├── App.css            # Global styles
│   ├── Login.jsx          # User authentication
│   ├── Signup.jsx         # User registration
│   ├── createProject.jsx  # New project creation
│   ├── supabaseClient.js  # Supabase configuration
│   └── main.jsx           # React app entry point
├── sql/                   # Database setup scripts
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

## Environment Variables

The application requires the following environment variables:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Note:** The `VITE_` prefix is required for Vite to expose these variables to the client-side code.

## Common Issues & Troubleshooting

### PDF Viewing Issues
- **CORS Errors**: Ensure PDF.js worker is properly configured
- **File Not Loading**: Check Supabase Storage policies and file URLs
- **Version Mismatch**: Verify react-pdf and pdfjs-dist versions are compatible

### Database Connection Issues
- **Auth Errors**: Verify Supabase URL and anon key are correct
- **RLS Policies**: Ensure Row Level Security policies are properly configured
- **Table Permissions**: Check that authenticated users have proper access

### File Upload Problems
- **Storage Bucket**: Ensure `student-submissions` bucket exists
- **File Size Limits**: Check Supabase storage limits (default 50MB)
- **File Type Restrictions**: Currently optimized for PDF files

### Development Setup
- **Node Version**: Ensure Node.js 16+ is installed
- **Environment Variables**: Verify `.env` file is created and populated
- **Dependencies**: Run `npm install` if modules are missing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.
