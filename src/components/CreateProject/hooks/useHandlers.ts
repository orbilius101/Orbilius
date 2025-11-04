import { supabase } from '../../../supabaseClient';

export function useCreateProjectHandlers(data: any) {
  const { projectTitle, grade, userData, navigate, showAlert } = data;

  // Function to generate due dates with 1 month intervals
  const generateDueDates = () => {
    const today = new Date();
    const dueDates: any = {};

    for (let i = 1; i <= 5; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i); // Add i months from today
      dueDates[`step${i}`] = dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    return dueDates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) {
      showAlert('User data not loaded. Please try again.', 'Error');
      return;
    }

    const dueDates = generateDueDates();

    // Log the data being inserted for debugging
    console.log('Creating project with user ID:', userData.id);
    console.log('User data:', userData);

    const { data: insertData, error } = await supabase
      .from('projects')
      .insert([
        {
          student_id: userData.id,
          email: userData.email,
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
      ])
      .select();

    if (error) {
      console.error('Project creation error:', error);
      showAlert(
        'Error creating project: ' +
          error.message +
          '\n\nThis may be a database configuration issue. Please contact your administrator.',
        'Error'
      );
    } else {
      console.log('Project created:', insertData);
      showAlert('Project created successfully!', 'Success');
      navigate('/student/dashboard');
    }
  };

  return {
    handleSubmit,
  };
}
