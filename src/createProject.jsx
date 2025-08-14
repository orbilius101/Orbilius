import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateProject() {
  const [projectTitle, setProjectTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndInfo = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/login');
        return;
      }

      const userId = session.user.id;

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('first_name, last_name, teacher_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }

      setUserData({
        id: userId,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        teacher_id: userProfile.teacher_id,
      });
    };

    fetchUserAndInfo();
  }, [navigate]);

  // Function to generate due dates with 1 month intervals
  const generateDueDates = () => {
    const today = new Date();
    const dueDates = {};
    
    for (let i = 1; i <= 5; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i); // Add i months from today
      dueDates[`step${i}`] = dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    return dueDates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) return;

    const dueDates = generateDueDates();

    const { error } = await supabase.from('projects').insert([
      {
        student_id: userData.id,
        //Check if teacher_id actually works had an error before where
        //the student ID was assigned to teacher_id
        teacher_id: userData.teacher_id || null,
        first_name: userData.first_name,
        last_name: userData.last_name,
        grade: parseInt(grade),
        project_title: projectTitle,
        current_step: 1,
        current_step_status: 'In Progress',
        step1_status: 'In Progress',
        step2_status: 'Not Started',
        step3_status: 'Not Started',
        step4_status: 'Not Started',
        step5_status: 'Not Started',
        step1_due_date: dueDates.step1,
        step2_due_date: dueDates.step2,
        step3_due_date: dueDates.step3,
        step4_due_date: dueDates.step4,
        step5_due_date: dueDates.step5,
        submitted_to_orbilius: false,
        approved_by_orbilius: false,
      },
    ]);

    if (error) {
      alert('Error creating project: ' + error.message);
    } else {
      alert('Project created successfully!');
      navigate('/student/dashboard');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
    }}>
      <div style={{
        padding: '2rem',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>Create New Project</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Project Title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            style={inputStyle}
          />

          //This section displays the due dates for each step and will be changed
          <div style={{ padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '5px', border: '1px solid #d0d7de' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Project Timeline</h4>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
              Each step will have a 1-month deadline starting from today:
            </p>
            <ul style={{ margin: '0.5rem 0 0 1rem', fontSize: '0.85rem', color: '#555' }}>
              <li>Step 1: Initial Research - Due in 1 month</li>
              <li>Step 2: Design Brief - Due in 2 months</li>
              <li>Step 3: Planning - Due in 3 months</li>
              <li>Step 4: Implementation - Due in 4 months</li>
              <li>Step 5: Archival Records - Due in 5 months</li>
            </ul>
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem',
              borderRadius: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '5px',
  border: '1px solid #ccc',
};
