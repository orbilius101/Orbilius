export function useDashboardHandlers(data: any) {
  const { _navigate, userProfile, showAlert } = data;

  const getCurrentStepName = (stepNum) => {
    const stepNames = {
      1: 'Initial Research',
      2: 'Design Brief',
      3: 'Planning',
      4: 'Implementation',
      5: 'Archival Records',
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
      year: '2-digit',
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

    return status || 'Not Started';
  };

  const getActionButtonText = (project) => {
    const allStepsApproved = [1, 2, 3, 4, 5].every(
      (step) => project[`step${step}_status`] === 'Approved'
    );

    if (allStepsApproved) {
      return 'Submit to Orbilius';
    }

    const currentStepStatus = project[`step${project.current_step}_status`];
    if (currentStepStatus === 'Submitted') {
      return 'Email Student';
    }

    return 'Email Student';
  };

  const handleActionClick = (project) => {
    const allStepsApproved = [1, 2, 3, 4, 5].every(
      (step) => project[`step${step}_status`] === 'Approved'
    );

    if (allStepsApproved) {
      showAlert('Submit to Orbilius functionality coming soon!', 'Info');
      return;
    }

    const studentEmail = project.student?.email || project.email;
    const studentFirstName = project.student?.first_name || project.first_name;
    const currentStepStatus = project[`step${project.current_step}_status`];
    const currentStepName = getCurrentStepName(project.current_step);

    if (!studentEmail) {
      showAlert('Student email not found. Please check the project data.', 'Error');
      return;
    }

    let subject, body;

    if (currentStepStatus === 'Submitted') {
      subject = `Feedback on ${project.project_title} - Step ${project.current_step}`;
      body = `Hello ${studentFirstName},

I have reviewed your submission for Step ${project.current_step}: ${currentStepName} of your project "${project.project_title}".

Please log into the Orbilius platform to view my feedback and next steps.

If you have any questions, please don't hesitate to reach out.

Best regards,
${userProfile?.first_name || 'Your Teacher'}`;
    } else {
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

  return {
    getCurrentStepName,
    getCurrentStepDueDate,
    getCurrentStepSubmissionStatus,
    getActionButtonText,
    handleActionClick,
  };
}
