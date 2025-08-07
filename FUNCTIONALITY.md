# Orbilius - Student Project Management System

## Overview
Orbilius is a comprehensive student project management application built with React and Supabase. It provides a structured workflow for students to complete project steps and for teachers to review and approve submissions.

## Features

### Student Features
- **User Authentication**: Secure login and signup
- **Project Creation**: Create new projects with teacher assignment
- **Step-by-Step Workflow**: 5-step project cycle with sequential access
- **File Upload**: PDF submission for each step
- **Progress Tracking**: Visual progress indicators and status tracking
- **Dashboard**: Overview of current project status and next steps

### Teacher Features
- **Teacher Dashboard**: View all assigned student projects
- **Project Monitoring**: Track student progress and timelines
- **Step Approval**: Review submissions with in-browser PDF viewing
- **Comment System**: Provide feedback on student submissions
- **Email Integration**: Contact students directly from the dashboard

## Project Structure

```
src/
├── App.jsx                 # Main application router
├── Login.jsx              # Student/Teacher login
├── Signup.jsx             # Student signup
├── createProject.jsx      # Project creation form
├── supabaseClient.js      # Supabase configuration
├── student/
│   ├── dashboard.jsx      # Student dashboard
│   ├── submitStep.jsx     # General step submission
│   └── step1-5/
│       ├── stepXIndex.jsx # Step overview pages
│       └── stepXUpload.jsx # Step upload pages
└── teacher/
    ├── dashboard.jsx      # Teacher dashboard
    └── stepApproval.jsx   # PDF review and approval
```

## Database Schema

### Key Tables
- **users**: User profiles (students and teachers)
- **projects**: Project information and step status
- **submissions**: File uploads and teacher comments

### Required Columns
```sql
-- Add teacher comments to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS teacher_comments TEXT;

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS comment_updated_at TIMESTAMP WITH TIME ZONE;
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
- Create a Supabase project
- Set up the required tables (users, projects, submissions)
- Configure storage bucket for file uploads
- Update `src/supabaseClient.js` with your Supabase credentials

### 3. Database Setup
Run the SQL scripts in the `sql/` directory:
```sql
-- Add teacher comments support
\i sql/add_teacher_comments.sql
```

### 4. Start Development Server
```bash
npm run dev
```

## Workflow

### Student Workflow
1. **Login/Signup**: Create account or log in
2. **Create Project**: Set up new project with teacher assignment
3. **Complete Steps**: Work through 5 project phases sequentially
4. **Upload Submissions**: Submit PDF files for teacher review
5. **Track Progress**: Monitor approval status and feedback

### Teacher Workflow
1. **Login**: Access teacher dashboard
2. **Review Projects**: View all assigned student projects
3. **Review Submissions**: Open step approval page for submitted work
4. **Provide Feedback**: Add comments and approve/request revisions
5. **Track Progress**: Monitor student timelines and completion status

## Project Steps

1. **Initial Research**: Literature review and bibliography
2. **Design Brief**: Project planning and scope definition
3. **Planning**: Detailed project timeline and methodology
4. **Implementation**: Project execution and development
5. **Archival Records**: Final documentation and reflection

## Key Features

### PDF Viewing
- In-browser PDF viewing using react-pdf
- Page navigation controls
- Full-screen viewing capability

### Status Management
- Sequential step access (students can't skip ahead)
- Automatic status updates on approval
- Clear visual indicators for step status

### Comment System
- Teachers can provide detailed feedback
- Comments saved with timestamps
- Students can view teacher feedback

### Email Integration
- Direct email links from teacher dashboard
- Pre-populated subject and message templates
- Student contact management

## API Integration

### Supabase Features Used
- **Authentication**: User management and session handling
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: File upload and management
- **Row Level Security**: Data access control

### File Upload
- Secure file storage in Supabase Storage
- PDF format validation
- Unique file naming with timestamps
- Public URL generation for viewing

## Error Handling
- Comprehensive error messages
- Loading states for all async operations
- Fallback UI for missing data
- Database connectivity error handling

## Security
- Row Level Security (RLS) policies
- User authentication required for all operations
- File access control
- Input validation and sanitization

## Future Enhancements
- Real-time notifications
- Bulk project management
- Advanced comment threading
- Integration with external learning management systems
- Mobile responsive design improvements
- Export functionality for project reports

## Development Notes
- Built with React 19 and Vite
- Uses modern React hooks and functional components
- Responsive design with inline styles
- Modular component structure
- TypeScript support ready
