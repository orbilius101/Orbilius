import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [project, setProject] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editingDueDate, setEditingDueDate] = useState(null);
  const [editedDueDate, setEditedDueDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
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

        // Get user profile from metadata instead of separate table
        const profile = {
          first_name: user.user_metadata?.first_name || 'Unknown',
          last_name: user.user_metadata?.last_name || 'User',
        };

        setUserProfile(profile);
        console.log('User loaded:', user.email, profile); // Debug log

        // Fetch project for the student
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('student_id', user.id)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError.message);
        } else {
          setProject(projectData);
          setEditedTitle(projectData?.project_title || '');
        }
      } catch (err) {
        console.error('Error in fetchUserAndProfile:', err);
        // Still set basic user data even if there's an error
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          setUserProfile({
            first_name: session.user.user_metadata?.first_name || 'Unknown',
            last_name: session.user.user_metadata?.last_name || 'User',
          });
        }
      }
    };

    fetchUserAndProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/login');
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditedTitle(project?.project_title || '');
  };

  const handleTitleSave = async () => {
    if (!editedTitle.trim()) {
      alert('Project title cannot be empty.');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ project_title: editedTitle.trim() })
        .eq('project_id', project.project_id);

      if (error) {
        console.error('Error updating project title:', error.message);
        alert('Error updating project title. Please try again.');
      } else {
        setProject({ ...project, project_title: editedTitle.trim() });
        setIsEditingTitle(false);
      }
    } catch (error) {
      console.error('Error updating project title:', error);
      alert('Error updating project title. Please try again.');
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle(project?.project_title || '');
  };

  const handleDueDateEdit = (stepNum) => {
    const currentDueDate = project?.[`step${stepNum}_due_date`];
    setEditingDueDate(stepNum);
    // Format date for input field (YYYY-MM-DD)
    if (currentDueDate) {
      const date = new Date(currentDueDate);
      const formattedDate = date.toISOString().split('T')[0];
      setEditedDueDate(formattedDate);
    } else {
      setEditedDueDate('');
    }
  };

  const handleDueDateSave = async (stepNum) => {
    if (!editedDueDate) {
      alert('Please select a due date.');
      return;
    }

    // Validate that the date is not in the past
    const selectedDate = new Date(editedDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (selectedDate < today) {
      alert('Due date cannot be in the past. Please select a current or future date.');
      return;
    }

    try {
      const dueDateField = `step${stepNum}_due_date`;
      const { error } = await supabase
        .from('projects')
        .update({ [dueDateField]: editedDueDate })
        .eq('project_id', project.project_id);

      if (error) {
        console.error('Error updating due date:', error.message);
        alert('Error updating due date. Please try again.');
      } else {
        setProject({ ...project, [dueDateField]: editedDueDate });
        setEditingDueDate(null);
        setEditedDueDate('');
      }
    } catch (error) {
      console.error('Error updating due date:', error);
      alert('Error updating due date. Please try again.');
    }
  };

  const handleDueDateCancel = () => {
    setEditingDueDate(null);
    setEditedDueDate('');
  };

  const renderRow = (stepNum, title) => {
    const status = project?.[`step${stepNum}_status`] || 'Not Started';
    const due = project?.[`step${stepNum}_due_date`]
      ? new Date(project[`step${stepNum}_due_date`]).toLocaleDateString()
      : 'N/A';

    // Determine if this step is accessible based on previous step approval
    const isAccessible = () => {
      if (stepNum === 1) return true; // Step 1 is always accessible

      // For other steps, check if previous step is approved
      const previousStepStatus = project?.[`step${stepNum - 1}_status`];
      return previousStepStatus === 'Approved';
    };

    // Determine the link destination based on status
    const getStepLink = () => {
      if (!isAccessible()) return null;

      const stepNames = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
      const stepName = stepNames[stepNum];

      if (status === 'In Progress' || status === 'Not Started') {
        return `/student/step${stepNum}/step${stepName}Index`;
      } else if (status === 'Submitted' || status === 'Approved') {
        return `/student/step${stepNum}/step${stepName}Upload`;
      }
      return null;
    };

    const stepLink = getStepLink();
    const accessible = isAccessible();
    const isApproved = status === 'Approved';
    const isEditingThisDate = editingDueDate === stepNum;

    const stepText = `Step ${stepNum}: ${title}`;
    const stepStyle = {
      paddingBottom: '1rem',
      textAlign: 'left',
      cursor: accessible && stepLink ? 'pointer' : 'default',
      color: accessible ? (stepLink ? '#007bff' : 'black') : '#999999',
      textDecoration: accessible && stepLink ? 'underline' : 'none',
    };

    const handleStepClick = () => {
      if (accessible && stepLink) {
        navigate(stepLink);
      }
    };

    return (
      <tr key={stepNum}>
        <td style={stepStyle} onClick={handleStepClick}>
          {stepText}
        </td>
        <td style={{ padding: '0 3rem' }}></td>
        <td style={{ paddingBottom: '1rem', textAlign: 'left' }}>{status}</td>
        <td style={{ paddingBottom: '1rem', textAlign: 'left' }}>
          <div style={dueDateCellStyle}>
            {!isEditingThisDate ? (
              <>
                <span>{due}</span>
                {!isApproved && (
                  <button onClick={() => handleDueDateEdit(stepNum)} style={dueDateEditButtonStyle}>
                    ✎
                  </button>
                )}
              </>
            ) : (
              <div style={dueDateEditContainerStyle}>
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  style={dueDateInputStyle}
                  autoFocus
                />
                <div style={dueDateButtonGroupStyle}>
                  <button onClick={() => handleDueDateSave(stepNum)} style={dueDateSaveButtonStyle}>
                    ✓
                  </button>
                  <button onClick={handleDueDateCancel} style={dueDateCancelButtonStyle}>
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        color: 'black',
        minHeight: '100vh',
        padding: '3rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {user && userProfile ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <h1 style={{ fontSize: '42px', margin: 0, textAlign: 'left' }}>
                {userProfile.first_name} {userProfile.last_name}'s Student Dashboard
              </h1>
              <button onClick={handleSignOut} style={signOutButtonStyle}>
                Sign Out
              </button>
            </div>

            {/* Project Title Section */}
            {project && (
              <div style={projectTitleSectionStyle}>
                <div style={projectTitleContainerStyle}>
                  {!isEditingTitle ? (
                    <>
                      <h2 style={projectTitleStyle}>
                        {project.project_title || 'Untitled Project'}
                      </h2>
                      <button onClick={handleTitleEdit} style={editButtonStyle}>
                        ✎ Edit
                      </button>
                    </>
                  ) : (
                    <div style={editContainerStyle}>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        style={titleInputStyle}
                        placeholder="Enter project title"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleTitleSave();
                          } else if (e.key === 'Escape') {
                            handleTitleCancel();
                          }
                        }}
                      />
                      <div style={buttonGroupStyle}>
                        <button onClick={handleTitleSave} style={saveButtonStyle}>
                          Save
                        </button>
                        <button onClick={handleTitleCancel} style={cancelButtonStyle}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {project ? (
              <table style={{ width: '100%', fontSize: '20px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textDecoration: 'underline',
                        textAlign: 'left',
                        paddingBottom: '1rem',
                      }}
                    >
                      Project Cycle Phases
                    </th>
                    <th></th>
                    <th
                      style={{
                        textDecoration: 'underline',
                        textAlign: 'left',
                        paddingBottom: '1rem',
                      }}
                    >
                      Status
                    </th>
                    <th style={{ textAlign: 'left', paddingBottom: '1rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {renderRow(1, 'Initial Research')}
                  {renderRow(2, 'Design Brief')}
                  {renderRow(3, 'Planning')}
                  {renderRow(4, 'Implementation')}
                  {renderRow(5, 'Closeout - Archival Records')}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: '18px' }}>No project found.</p>
            )}

            <div
              style={{
                marginTop: '4rem',
                display: 'flex',
                justifyContent: 'space-evenly',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <button style={buttonStyle}>Bi-weekly Reflections</button>
              <button style={buttonStyle}>One-on-one Meeting Log</button>
              <button style={buttonStyle}>Help Docs & Videos</button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: '18px' }}>Loading user...</p>
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '1.2rem 2.5rem',
  backgroundColor: '#e0e0e0',
  border: 'none',
  borderRadius: '8px',
  fontSize: '18px',
  cursor: 'pointer',
  fontWeight: '500',
};

const signOutButtonStyle = {
  padding: '0.8rem 1.5rem',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'background-color 0.2s',
};

const projectTitleSectionStyle = {
  marginBottom: '3rem',
  borderBottom: '1px solid #e0e0e0',
  paddingBottom: '1.5rem',
};

const projectTitleContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const projectTitleStyle = {
  fontSize: '28px',
  margin: 0,
  color: '#333',
  fontWeight: '500',
};

const editButtonStyle = {
  padding: '0.4rem 0.8rem',
  backgroundColor: 'transparent',
  border: '1px solid #ccc',
  borderRadius: '4px',
  color: '#666',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: '400',
  transition: 'all 0.2s',
};

const editContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  flex: 1,
};

const titleInputStyle = {
  fontSize: '28px',
  padding: '0.5rem',
  border: '2px solid #007bff',
  borderRadius: '6px',
  fontWeight: '500',
  color: '#333',
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  outline: 'none',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '0.5rem',
};

const saveButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
};

const cancelButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
};

const dueDateCellStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const dueDateEditButtonStyle = {
  padding: '0.2rem 0.4rem',
  backgroundColor: 'transparent',
  border: '1px solid #ccc',
  borderRadius: '3px',
  color: '#666',
  fontSize: '10px',
  cursor: 'pointer',
  fontWeight: '400',
  transition: 'all 0.2s',
};

const dueDateEditContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const dueDateInputStyle = {
  padding: '0.3rem',
  border: '1px solid #007bff',
  borderRadius: '4px',
  fontSize: '14px',
  backgroundColor: '#ffffff',
  color: '#333',
  outline: 'none',
};

const dueDateButtonGroupStyle = {
  display: 'flex',
  gap: '0.3rem',
};

const dueDateSaveButtonStyle = {
  padding: '0.3rem 0.5rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: '500',
};

const dueDateCancelButtonStyle = {
  padding: '0.3rem 0.5rem',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: '500',
};
