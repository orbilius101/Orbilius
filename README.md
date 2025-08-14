# Orbilius PM - Student Project Management System

A comprehensive React-based web application designed to streamline the management of student projects through a structured 5-step workflow with teacher oversight, admin certification, and approval processes. Built with modern web technologies and powered by Supabase for real-time data management and secure file storage.

## Project Overview

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

Orbilius PM addresses these challenges by providing a digital platform that ensures accountability, transparency, and effective communication throughout the project lifecycle.

## Core Features

### Student Features
- **Secure Authentication**: Sign up with teacher-provided ID for class enrollment
- **Password Reset**: Self-service password reset functionality via email
- **Project Creation**: Initialize new projects with automatic due date generation (1 month per step)
- **Editable Project Details**: Modify project title and due dates until steps are approved
- **5-Step Workflow**: Navigate through structured project phases:
  1. **Initial Research** - Foundation and background research with downloadable resource PDFs
  2. **Design Brief** - Project planning and design documentation with downloadable resources
  3. **Planning** - Detailed implementation planning
  4. **Implementation** - Active project development
  5. **Archival Records** - Final documentation and reflection
- **File Submission**: Upload PDF documents for each step with duplicate upload prevention
- **Progress Tracking**: View current step status, due dates, and timeline
- **Teacher Feedback**: Receive detailed comments and revision requests
- **Resubmission Capability**: Revise and resubmit work based on teacher feedback
- **Resource Downloads**: Access step-specific resource PDFs from Supabase Storage

### Teacher Features
- **Comprehensive Dashboard**: Monitor all assigned students and projects with student details
- **Student Information Display**: View student names and email addresses via database relationships
- **Project Oversight**: Track student progress across all project phases with status indicators
- **PDF Review System**: In-browser PDF viewing with navigation controls
- **Feedback System**: Leave detailed comments for student improvement
- **Approval Workflow**: Approve completed steps or request revisions with status updates
- **Email Integration**: Direct mailto links with pre-filled subject and body content for student communication
- **Teacher ID Management**: Easy access to unique teacher ID for student enrollment with copy functionality
- **Admin Code Validation**: Secure teacher registration with admin-controlled access codes
- **Project Certification**: Automatic submission to Orbilius archive when all 5 steps are approved

### Admin Features
- **Admin Dashboard**: Comprehensive administrative control panel
- **Admin Code Management**: View and update teacher registration codes with improved security
- **Project Certification**: Review and certify completed student projects for final archive submission
- **Database Management**: Handle Row Level Security (RLS) policies with graceful error handling
- **System Oversight**: Monitor all projects across the platform with certification status tracking

### Technical Features
- **Real-time Updates**: Instant synchronization of project status changes
- **Secure File Storage**: Supabase Storage with Row Level Security (RLS) and public URL access for resources
- **Responsive Design**: Optimized for desktop and mobile devices with accessible UI elements
- **PDF Processing**: Advanced PDF viewing with react-pdf integration and error handling
- **Authentication & Authorization**: Multi-role user management (student/teacher/admin) with Supabase Auth
- **Database Management**: PostgreSQL backend with automatic scaling and foreign key relationships
- **Professional UI/UX**: Clean, modern interface with consistent styling and accessibility features
- **Database Management**: PostgreSQL backend with automatic scaling

## User Workflow

### For Students:
1. **Registration**: Sign up using teacher-provided Teacher ID with validation
2. **Project Setup**: Create new project with automatic due date generation (1 month intervals)
3. **Project Management**: Edit project title and due dates until steps are approved
4. **Step-by-Step Progress**: 
   - Navigate to current step (sequential access enforced)
   - Download step-specific resource PDFs when available
   - Review step requirements and guidelines
   - Upload required PDF documentation (with duplicate prevention)
   - Submit for teacher review
   - Receive feedback and make revisions if needed
   - Proceed to next step upon approval
5. **Completion**: Complete all 5 steps for automatic submission to Orbilius archive

### For Teachers:
1. **Registration**: Sign up with admin-provided access code for verification
2. **Dashboard Access**: View all assigned student projects with comprehensive details
3. **Student Management**: View student names, emails, and contact information
4. **Progress Monitoring**: Track student progress with visual status indicators
5. **Review Process**:
   - Click on submitted project titles to access review interface
   - View student-submitted PDF documents with full navigation
   - Navigate through multi-page documents
   - Leave detailed feedback comments
   - Choose to approve step or request revisions with automatic status updates
6. **Communication**: Send pre-filled emails to students directly from dashboard
7. **ID Distribution**: Share unique Teacher ID with students for enrollment via copy function
8. **Project Completion**: Automatically submit completed projects (all 5 steps approved) to Orbilius

### For Administrators:
1. **System Access**: Access admin dashboard with elevated privileges
2. **Teacher Management**: 
   - View and update admin codes for teacher registration
   - Manage teacher access to the system
3. **Project Oversight**:
   - View all projects across the platform
   - Certify completed projects for final archive submission
   - Monitor system-wide project completion rates
4. **Database Management**: Handle RLS policies and system maintenance with error recovery

## System Architecture

### Frontend (React + Vite)
- **Component Structure**: Modular React components for different user interfaces
- **Routing**: React Router for seamless navigation between pages
- **State Management**: React hooks for local state and Supabase for global state
- **Styling**: Inline CSS objects for consistent, maintainable styling
- **PDF Handling**: react-pdf with PDF.js for document rendering

### Backend (Supabase)
- **Database**: PostgreSQL with the following key tables:
  - `users`: User profiles and authentication data with role-based access (student/teacher/admin)
  - `projects`: Project information and step tracking with foreign key relationships
  - `submissions`: File submissions and teacher feedback
  - `admin_code`: Secure admin codes for teacher registration
- **Authentication**: Multi-role email/password authentication with secure session management
- **Storage**: File upload and retrieval with signed URLs for security and public URLs for resources
- **Real-time**: Automatic updates when data changes across all user interfaces
- **Row Level Security**: Comprehensive RLS policies for multi-tenant data isolation

### Security Features
- **Row Level Security (RLS)**: Database-level access controls with admin override capabilities
- **Authenticated File Access**: Secure file storage with user-specific permissions
- **Session Management**: Automatic login state persistence and secure logout
- **Role-based Authorization**: Different access levels for students, teachers, and administrators
- **Admin Code Protection**: Secure teacher registration with encrypted access codes
- **Teacher-Student Isolation**: Students can only access their own projects

## Features

### Core Functionality
- Multi-role authentication (Student/Teacher/Admin) with secure registration
- Password reset functionality via email
- 5-step project workflow with sequential progression
- File upload/download with PDF viewing and navigation
- Teacher approval system with detailed feedback
- Real-time project status updates
- Admin dashboard for system management
- Project certification and archive submission

### User Experience
- Professional, accessible UI/UX design
- Responsive layout for all device types
- Intuitive navigation with clear status indicators
- Comprehensive error handling and user feedback
- Resource downloads with user-friendly file management

### Communication & Collaboration
- Direct teacher-student email integration with pre-filled content
- Teacher ID sharing system for easy student enrollment
- Admin code management for teacher registration
- Comment system for detailed feedback on submissions

### Security & Data Management
- Row Level Security (RLS) with graceful error handling
- Secure file storage with appropriate access controls
- Foreign key relationships for data integrity
- Automatic due date generation and timeline management

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
     submitted_to_orbilius BOOLEAN DEFAULT FALSE,
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

   **admin_code table:**
   ```sql
   CREATE TABLE admin_code (
     id SERIAL PRIMARY KEY,
     code TEXT NOT NULL,
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Insert initial admin code
   INSERT INTO admin_code (code) VALUES ('ADMIN2024');
   ```
   
   **Set up Storage:**
   - Create a storage bucket named `student-submissions`
   - Create a storage bucket named `resources` for downloadable materials
   - Configure RLS policies for secure file access
   
   **Upload Resource Files:**
   - Upload `step1_resource.pdf` to the `resources` bucket
   - Upload `step2_resource.pdf` to the `resources` bucket
   - Set appropriate access policies for public resource access
   
   **Row Level Security Policies:**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE admin_code ENABLE ROW LEVEL SECURITY;
   
   -- Users can only see their own profile
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);
   
   -- Students can only see their own projects, teachers can see assigned projects
   CREATE POLICY "Project access" ON projects
     FOR SELECT USING (
       auth.uid() = student_id OR auth.uid() = teacher_id
     );
   
   -- Admin users can update admin_code table
   CREATE POLICY "Admin can update admin code" ON admin_code
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM users 
         WHERE users.id = auth.uid() 
         AND users.user_type = 'admin'
       )
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
│   │   ├── dashboard.jsx  # Student project dashboard with editable fields
│   │   ├── submitStep.jsx # Generic step submission component
│   │   └── step1-5/       # Individual step components
│   │       ├── stepXIndex.jsx   # Step overview pages with resource downloads
│   │       └── stepXUpload.jsx  # Step upload pages with duplicate prevention
│   ├── teacher/           # Teacher-specific components
│   │   ├── dashboard.jsx  # Teacher project oversight dashboard with email integration
│   │   └── stepApproval.jsx # PDF review and approval interface with comments
│   ├── admin/             # Admin-specific components
│   │   └── dashboard.jsx  # Admin control panel for system management
│   ├── App.jsx            # Main app component with multi-role routing
│   ├── App.css            # Global styles
│   ├── LandingPage.jsx    # Public landing page with branding
│   ├── Login.jsx          # Multi-role user authentication
│   ├── Signup.jsx         # User registration with admin code validation
│   ├── ResetPassword.jsx  # Password reset functionality
│   ├── createProject.jsx  # New project creation with auto due dates
│   ├── supabaseClient.js  # Supabase configuration
│   └── main.jsx           # React app entry point
├── sql/                   # Database setup scripts and RLS policies
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
- **Supabase Setup**: Ensure all tables, RLS policies, and storage buckets are configured
- **Resource Files**: Upload step resource PDFs to the `resources` bucket

### Admin Setup
- **Initial Admin User**: Create admin user manually in Supabase Auth dashboard
- **Admin Code**: Insert initial admin code in `admin_code` table
- **RLS Policies**: Ensure admin users have proper access to admin_code table
- **Storage Buckets**: Verify both `student-submissions` and `resources` buckets exist

### Teacher Registration
- **Admin Code Required**: Teachers need current admin code to register
- **Teacher ID**: Each teacher gets unique ID for student enrollment
- **Student Assignment**: Students use teacher ID during registration for automatic assignment

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
