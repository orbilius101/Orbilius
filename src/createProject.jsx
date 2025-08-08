import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function CreateProject() {
  const [projectTitle, setProjectTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [dueDates, setDueDates] = useState({
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    step5: '',
  });

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

  const handleDateChange = (step, value) => {
    setDueDates((prev) => ({ ...prev, [step]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) return;

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

          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.9rem', color: '#555' }}>Step {step} Due Date:</label>
              <input
                type="date"
                value={dueDates[`step${step}`]}
                onChange={(e) => handleDateChange(`step${step}`, e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          ))}

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
