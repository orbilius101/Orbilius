import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
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
        return;
      }

      setUserProfile(profile);

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
        <td style={{ paddingBottom: '1rem', textAlign: 'left' }}>{due}</td>
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '3rem' 
            }}>
              <h1 style={{ fontSize: '42px', margin: 0, textAlign: 'left' }}>
                {userProfile.first_name} {userProfile.last_name}'s Student Dashboard
              </h1>
              <button 
                onClick={handleSignOut}
                style={signOutButtonStyle}
              >
                Sign Out
              </button>
            </div>

            {project ? (
              <table style={{ width: '100%', fontSize: '20px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textDecoration: 'underline', textAlign: 'left', paddingBottom: '1rem' }}>Project Cycle Phases</th>
                    <th></th>
                    <th style={{ textDecoration: 'underline', textAlign: 'left', paddingBottom: '1rem' }}>Status</th>
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

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-evenly', gap: '1rem', flexWrap: 'wrap' }}>
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
