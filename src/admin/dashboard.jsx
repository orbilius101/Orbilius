import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminCode, setAdminCode] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [comments, setComments] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchAdminCode();
    fetchPendingProjects();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || userData.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/login');
      return;
    }

    setUser(user);
    setLoading(false);
  };

  const fetchAdminCode = async () => {
    console.log('Fetching admin code...'); // Debug log
    
    try {
      // First, let's see what's in the table - remove the single() call here too
      const { data: allData, error: allError } = await supabase
        .from('admin_code')
        .select('*');
      
      console.log('All admin_code table data:', { allData, allError }); // Debug log
      console.log('Data length:', allData?.length); // Debug log
      
      if (allError) {
        console.error('Error accessing admin_code table:', allError.message);
        alert('Error accessing admin_code table: ' + allError.message + '. Please check if the table exists and RLS policies allow access.');
        return;
      }
      
      // Check if we got an empty array due to RLS filtering
      if (!allData || allData.length === 0) {
        console.log('Empty result - likely due to RLS policies filtering rows');
        alert(`Admin code table query returned no rows. This is likely due to RLS policies.
        
The table exists and has data, but RLS policies are preventing access.
        
Please either:
1. Disable RLS on admin_code table, or
2. Add RLS policy to allow admin users to read admin_code table

For now, using a default admin code.`);
        
        // Use the admin code we can see in the Supabase dashboard
        setAdminCode('orbilius2027%*%*9');
        setNewAdminCode('orbilius2027%*%*9');
        return;
      }
      
      // Find the row with id=1
      const adminRow = allData.find(row => row.id === 1);
      
      if (adminRow) {
        console.log('Found admin code:', adminRow.orbilius_admin_code);
        setAdminCode(adminRow.orbilius_admin_code);
        setNewAdminCode(adminRow.orbilius_admin_code);
      } else {
        console.log('No row found with id=1 in returned data');
        alert('Admin code row with id=1 not found in the returned data.');
        setAdminCode('NOT_FOUND');
        setNewAdminCode('NOT_FOUND');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Unexpected error: ' + error.message);
    }
  };

  const fetchPendingProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_student_id_fkey(email, first_name, last_name),
        project_steps!inner(step_number, status, file_path)
      `)
      .eq('submitted_to_orbilius', true)
      .eq('approved_by_orbilius', false)
      .eq('project_steps.step_number', 5)
      .eq('project_steps.status', 'Approved');

    if (!error) {
      setProjects(data || []);
    }
  };

  const updateAdminCode = async () => {
    if (!newAdminCode.trim()) {
      alert('Admin code cannot be empty');
      return;
    }

    console.log('Updating admin code to:', newAdminCode); // Debug log

    try {
      const { data, error } = await supabase
        .from('admin_code')
        .update({ orbilius_admin_code: newAdminCode.trim() })
        .eq('id', 1)
        .select(); // Add select to see what was updated

      console.log('Update result:', { data, error }); // Debug log

      if (error) {
        console.error('Error updating admin code:', error.message);
        if (error.message.includes('row-level security')) {
          alert('Cannot update admin code due to RLS policies. Please update it directly in the Supabase dashboard.');
        } else {
          alert('Error updating admin code: ' + error.message);
        }
      } else if (data && data.length > 0) {
        console.log('Successfully updated admin code:', data[0]);
        setAdminCode(newAdminCode.trim());
        setIsEditingCode(false);
        alert('Admin code updated successfully');
        // Refresh the admin code from database to confirm
        await fetchAdminCode();
      } else {
        console.log('Update completed but no data returned');
        alert('Update may have failed - no rows were affected. Please check if the row exists.');
      }
    } catch (error) {
      console.error('Unexpected error during update:', error);
      alert('Unexpected error updating admin code: ' + error.message);
    }
  };

  const viewProjectSubmission = async (project) => {
    setSelectedProject(project);
    
    // Fetch the step 5 submission file
    const { data: stepData, error } = await supabase
      .from('project_steps')
      .select('file_path, youtube_link, teacher_comments')
      .eq('project_id', project.project_id)
      .eq('step_number', 5)
      .single();

    if (!error && stepData) {
      setSubmissionFile(stepData);
    }
  };

  const certifyProject = async (approved) => {
    if (!selectedProject) return;

    setUpdating(true);

    // Update project approval status
    const { error: projectError } = await supabase
      .from('projects')
      .update({ 
        approved_by_orbilius: approved,
        orbilius_comments: comments || null
      })
      .eq('project_id', selectedProject.project_id);

    if (projectError) {
      alert('Error updating project: ' + projectError.message);
      setUpdating(false);
      return;
    }

    // If not approved, update step 5 status back to "In Progress"
    if (!approved) {
      await supabase
        .from('project_steps')
        .update({ 
          status: 'In Progress',
          teacher_comments: comments || 'Project needs revision before Orbilius certification.'
        })
        .eq('project_id', selectedProject.project_id)
        .eq('step_number', 5);
    }

    alert(approved ? 'Project certified successfully!' : 'Project sent back for revision');
    setSelectedProject(null);
    setSubmissionFile(null);
    setComments('');
    setUpdating(false);
    fetchPendingProjects(); // Refresh the list
  };

  const downloadFile = async (filePath) => {
    if (!filePath) return;

    const { data, error } = await supabase.storage
      .from('project-files')
      .download(filePath);

    if (error) {
      alert('Error downloading file: ' + error.message);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Orbilius Admin Dashboard</h1>
        <button onClick={signOut} style={styles.signOutButton}>
          Sign Out
        </button>
      </div>

      {/* Admin Code Management */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Admin Code Management</h2>
        <div style={styles.adminCodeSection}>
          <div style={styles.codeDisplay}>
            <label style={styles.label}>Current Admin Code:</label>
            {isEditingCode ? (
              <div style={styles.editCodeContainer}>
                <input
                  type="text"
                  value={newAdminCode}
                  onChange={(e) => setNewAdminCode(e.target.value)}
                  style={styles.input}
                />
                <button onClick={updateAdminCode} style={styles.saveButton}>
                  Save
                </button>
                <button 
                  onClick={() => {
                    setIsEditingCode(false);
                    setNewAdminCode(adminCode);
                  }} 
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={styles.codeDisplayContainer}>
                <code style={styles.code}>{adminCode}</code>
                <button 
                  onClick={() => setIsEditingCode(true)} 
                  style={styles.editButton}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Certification Queue */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Project Certification Queue ({projects.length} pending)
        </h2>
        
        {projects.length === 0 ? (
          <p style={styles.noProjects}>No projects pending certification</p>
        ) : (
          <div style={styles.projectsList}>
            {projects.map((project) => (
              <div key={project.project_id} style={styles.projectCard}>
                <h3 style={styles.projectTitle}>{project.project_title}</h3>
                <p style={styles.studentInfo}>
                  Student: {project.users.first_name} {project.users.last_name} ({project.users.email})
                </p>
                <p style={styles.projectInfo}>
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
                <button 
                  onClick={() => viewProjectSubmission(project)}
                  style={styles.reviewButton}
                >
                  Review Final Submission
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Review Modal */}
      {selectedProject && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Reviewing: {selectedProject.project_title}
              </h2>
              <button 
                onClick={() => {
                  setSelectedProject(null);
                  setSubmissionFile(null);
                  setComments('');
                }}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.studentDetails}>
                <p><strong>Student:</strong> {selectedProject.users.first_name} {selectedProject.users.last_name}</p>
                <p><strong>Email:</strong> {selectedProject.users.email}</p>
                <p><strong>Project Created:</strong> {new Date(selectedProject.created_at).toLocaleDateString()}</p>
              </div>

              {submissionFile && (
                <div style={styles.submissionSection}>
                  <h3 style={styles.submissionTitle}>Step 5 Final Submission</h3>
                  
                  {submissionFile.file_path && (
                    <div style={styles.fileSection}>
                      <p><strong>Submitted File:</strong></p>
                      <button 
                        onClick={() => downloadFile(submissionFile.file_path)}
                        style={styles.downloadButton}
                      >
                        Download Submission
                      </button>
                    </div>
                  )}

                  {submissionFile.youtube_link && (
                    <div style={styles.videoSection}>
                      <p><strong>YouTube Video:</strong></p>
                      <a 
                        href={submissionFile.youtube_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.videoLink}
                      >
                        {submissionFile.youtube_link}
                      </a>
                    </div>
                  )}

                  {submissionFile.teacher_comments && (
                    <div style={styles.teacherComments}>
                      <p><strong>Teacher Comments:</strong></p>
                      <p style={styles.commentsText}>{submissionFile.teacher_comments}</p>
                    </div>
                  )}
                </div>
              )}

              <div style={styles.adminCommentsSection}>
                <label style={styles.label}>Orbilius Comments (optional):</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add comments for the student and teacher..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.actionButtons}>
                <button 
                  onClick={() => certifyProject(false)}
                  disabled={updating}
                  style={{...styles.rejectButton, ...(updating ? styles.buttonDisabled : {})}}
                >
                  {updating ? 'Processing...' : 'Send Back for Revision'}
                </button>
                <button 
                  onClick={() => certifyProject(true)}
                  disabled={updating}
                  style={{...styles.approveButton, ...(updating ? styles.buttonDisabled : {})}}
                >
                  {updating ? 'Processing...' : 'Certify Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '2rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  signOutButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  section: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    color: '#333',
  },
  adminCodeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  codeDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  editCodeContainer: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  codeDisplayContainer: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  code: {
    backgroundColor: '#f1f3f4',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '1.1rem',
    border: '1px solid #ddd',
    color: '#333', // Dark text for better contrast
    fontWeight: '600', // Make it more visible
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  noProjects: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.1rem',
    padding: '2rem',
  },
  projectsList: {
    display: 'grid',
    gap: '1rem',
  },
  projectCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
  },
  projectTitle: {
    margin: '0 0 0.5rem 0',
    color: '#333',
  },
  studentInfo: {
    margin: '0.5rem 0',
    color: '#555',
  },
  projectInfo: {
    margin: '0.5rem 0',
    color: '#666',
    fontSize: '0.9rem',
  },
  reviewButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    maxWidth: '800px',
    maxHeight: '90vh',
    width: '90%',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #ddd',
  },
  modalTitle: {
    margin: 0,
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#666',
  },
  modalBody: {
    padding: '1.5rem',
  },
  studentDetails: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
  },
  submissionSection: {
    marginBottom: '1.5rem',
  },
  submissionTitle: {
    marginTop: 0,
    marginBottom: '1rem',
    color: '#333',
  },
  fileSection: {
    marginBottom: '1rem',
  },
  downloadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  videoSection: {
    marginBottom: '1rem',
  },
  videoLink: {
    color: '#007bff',
    textDecoration: 'none',
    wordBreak: 'break-all',
  },
  teacherComments: {
    backgroundColor: '#e9ecef',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  commentsText: {
    margin: '0.5rem 0 0 0',
    fontStyle: 'italic',
  },
  adminCommentsSection: {
    marginBottom: '1.5rem',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  approveButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  rejectButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
};
