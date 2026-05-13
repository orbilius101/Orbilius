import { createDocument } from '../../../utils/firebaseHelpers';

export function useCreateProjectHandlers(data: any) {
  const { projectTitle, grade, userData, navigate, showAlert } = data;

  // Generate due dates based on IB project cycle intervals
  const generateDueDates = () => {
    const start = new Date();
    const addDays = (date: Date, days: number) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const step1 = addDays(start, 21);        // 3 weeks after start
    const step2 = addDays(step1, 7);         // 1 week after step 1
    const step3 = addDays(step2, 7);         // 1 week after step 2
    const step4 = addDays(step3, 70);        // 10 weeks after step 3
    const step5 = addDays(step4, 7);         // 1 week after step 4

    return {
      step1: fmt(step1),
      step2: fmt(step2),
      step3: fmt(step3),
      step4: fmt(step4),
      step5: fmt(step5),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) {
      showAlert('User data not loaded. Please try again.', 'Error');
      return;
    }

    // Validate required fields
    if (!projectTitle || projectTitle.trim() === '') {
      showAlert('Please enter a project title.', 'Error');
      return;
    }

    if (!grade || grade.trim() === '') {
      showAlert('Please select your grade.', 'Error');
      return;
    }

    const dueDates = generateDueDates();

    const projectData = {
      student_id: userData.id,
      email: userData.email,
      teacher_id: userData.teacher_id || null,
      first_name: userData.first_name,
      last_name: userData.last_name,
      grade: grade,
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
    };

    const { data: insertData, error } = await createDocument('projects', projectData);

    if (error) {
      console.error('Project creation error:', error);
      showAlert(
        'Error creating project: ' +
          error.message +
          '\n\nThis may be a database configuration issue. Please contact your administrator.',
        'Error'
      );
    } else {
      showAlert('Project created successfully!', 'Success');
      navigate('/student/dashboard');
    }
  };

  return {
    handleSubmit,
  };
}
