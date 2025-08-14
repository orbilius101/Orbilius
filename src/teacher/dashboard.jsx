import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        navigate('/login');
        return;
      }

      const user = session.user;
      setUser(user);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError.message);
      } else {
        setUserProfile(profile);
      }

      // Fetch all projects assigned to this teacher with student email
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          users!projects_student_id_fkey(email, first_name, last_name)
        `)
        .eq('teacher_id', user.id)
        .order('last_name', { ascending: true });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError.message);
      } else {
        setProjects(projectsData || []);
      }
    };

    fetchUserAndProjects();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/login');
    }
  };

  const getCurrentStepName = (stepNum) => {
    const stepNames = {
      1: 'Initial Research',
      2: 'Design Brief',
      3: 'Planning',
      4: 'Implementation',
      5: 'Archival Records'
    };
    return stepNames[stepNum] || 'Unknown';
  };

  const getCurrentStepDueDate = (project) => {
    const stepField = `step${project.current_step}_due_date`;
    const dueDate = project[stepField];
    
    if (!dueDate) return 'N/A';
    
    const date = new Date(dueDate);
    const today = new Date();
    const isOverdue = date < today;
    
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    });
    
    if (isOverdue) {
      return `Overdue - ${formattedDate}`;
    } else {
      return `Due: ${formattedDate}`;
    }
  };

  const getCurrentStepSubmissionStatus = (project) => {
    const stepField = `step${project.current_step}_status`;
    const status = project[stepField];
    
    // Return the actual step status or a default if null/undefined
    return status || 'Not Started';
  };

  const getActionButtonText = (project) => {
    // Check if all 5 steps are approved
    const allStepsApproved = [1, 2, 3, 4, 5].every(step => 
      project[`step${step}_status`] === 'Approved'
    );
    
    if (allStepsApproved) {
      return 'Submit to Orbilius';
    }
    
    // Check if current step is submitted and ready for approval
    const currentStepStatus = project[`step${project.current_step}_status`];
    if (currentStepStatus === 'Submitted') {
      return 'Email Student';
    }
    
    return 'Email Student';
  };

  const handleActionClick = (project) => {
    // Check if all 5 steps are approved
    const allStepsApproved = [1, 2, 3, 4, 5].every(step => 
      project[`step${step}_status`] === 'Approved'
    );
    
    if (allStepsApproved) {
      // Handle "Submit to Orbilius" action
      alert('Submit to Orbilius functionality coming soon!');
      return;
    }
    
    // For all other cases (including submitted), handle "Email Student" action
    const studentEmail = project.users?.email || project.email;
    const studentFirstName = project.users?.first_name || project.first_name;
    const currentStepStatus = project[`step${project.current_step}_status`];
    const currentStepName = getCurrentStepName(project.current_step);
    
    if (!studentEmail) {
      alert('Student email not found. Please check the project data.');
      return;
    }
    
    let subject, body;
    
    if (currentStepStatus === 'Submitted') {
      // Email for when student has submitted and needs feedback
      subject = `Feedback on ${project.project_title} - Step ${project.current_step}`;
      body = `Hello ${studentFirstName},

I have reviewed your submission for Step ${project.current_step}: ${currentStepName} of your project "${project.project_title}".

Please log into the Orbilius platform to view my feedback and next steps.

If you have any questions, please don't hesitate to reach out.

Best regards,
${userProfile?.first_name || 'Your Teacher'}`;
    } else {
      // General follow-up email
      subject = `Follow-up on ${project.project_title} - Step ${project.current_step}`;
      body = `Hello ${studentFirstName},

I wanted to follow up on your project "${project.project_title}".

You are currently on Step ${project.current_step}: ${currentStepName}.
Current status: ${currentStepStatus}

Please log into the Orbilius platform to continue your work or view any feedback.

If you need any assistance, please let me know.

Best regards,
${userProfile?.first_name || 'Your Teacher'}`;
    }
    
    const mailtoLink = `mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <button onClick={handleSignOut} style={styles.signOutButton}>
            Sign Out
          </button>
        </div>

        {projects.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Student Name</th>
                  <th style={styles.tableHeader}>Grade</th>
                  <th style={styles.tableHeader}>Project Title</th>
                  <th style={styles.tableHeader}>Current Cycle Step</th>
                  <th style={styles.tableHeader}>Timeline</th>
                  <th style={styles.tableHeader}>Step Status</th>
                  <th style={styles.tableHeader}></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.project_id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {project.users?.last_name || project.last_name}, {project.users?.first_name || project.first_name}
                    </td>
                    <td style={styles.tableCell}>{project.grade}</td>
                    <td style={styles.tableCell}>
                      {project[`step${project.current_step}_status`] === 'Submitted' ? (
                        <button
                          onClick={() => navigate(`/teacher/step-approval/${project.project_id}/${project.current_step}`)}
                          style={styles.projectTitleLink}
                        >
                          {project.project_title}
                        </button>
                      ) : (
                        project.project_title
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {project.current_step}/5 - {getCurrentStepName(project.current_step)}
                    </td>
                    <td style={styles.tableCell}>
                      {getCurrentStepDueDate(project)}
                    </td>
                    <td style={styles.tableCell}>
                      {getCurrentStepSubmissionStatus(project)}
                    </td>
                    <td style={styles.tableCell}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleActionClick(project)}
                      >
                        {getActionButtonText(project)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={styles.noProjects}>No projects assigned yet.</p>
        )}

        {/* Teacher ID Section */}
        <div style={styles.teacherIdSection}>
          <h3 style={styles.teacherIdTitle}>Student Signup Information</h3>
          <p style={styles.teacherIdDescription}>
            Students need your Teacher ID to sign up. Share this ID with your students:
          </p>
          <div style={styles.teacherIdContainer}>
            <span style={styles.teacherIdLabel}>Your Teacher ID:</span>
            <code style={styles.teacherId}>{user?.id}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user?.id);
                alert('Teacher ID copied to clipboard!');
              }}
              style={styles.copyButton}
            >
              Copy ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#111111',
    minHeight: '100vh',
    padding: '3rem',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '42px',
    margin: 0,
    textAlign: 'left',
  },
  signOutButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    fontSize: '16px',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  tableHeader: {
    textAlign: 'left',
    paddingBottom: '1rem',
    fontWeight: '600',
    fontSize: '18px',
    borderBottom: '2px solid #dee2e6',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
  },
  tableCell: {
    padding: '1rem 0.5rem',
    textAlign: 'left',
    fontSize: '16px',
    verticalAlign: 'middle',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
  projectTitleLink: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '16px',
    padding: 0,
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  noProjects: {
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '3rem',
    color: '#666666',
  },
  teacherIdSection: {
    marginTop: '3rem',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  teacherIdTitle: {
    fontSize: '20px',
    marginBottom: '0.5rem',
    color: '#111111',
  },
  teacherIdDescription: {
    fontSize: '16px',
    marginBottom: '1rem',
    color: '#666666',
  },
  teacherIdContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  teacherIdLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111111',
  },
  teacherId: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#495057',
    userSelect: 'all',
  },
  copyButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};
