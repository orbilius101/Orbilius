import { supabase } from '../../../../supabaseClient';

export function useDashboardHandlers(data: any) {
  const {
    project,
    setProject,
    editedTitle,
    setIsEditingTitle,
    setEditedTitle,
    setEditingDueDate,
    _editedDueDate,
    setEditedDueDate,
    _navigate,
    showAlert,
  } = data;

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditedTitle(project?.project_title || '');
  };

  const handleTitleSave = async () => {
    if (!editedTitle.trim()) {
      showAlert('Project title cannot be empty.', 'Error');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ project_title: editedTitle.trim() })
        .eq('project_id', project.project_id);

      if (error) {
        console.error('Error updating project title:', error.message);
        showAlert('Error updating project title. Please try again.', 'Error');
      } else {
        setProject({ ...project, project_title: editedTitle.trim() });
        setIsEditingTitle(false);
      }
    } catch (error) {
      console.error('Error updating project title:', error);
      showAlert('Error updating project title. Please try again.', 'Error');
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

  const handleDueDateSave = async (stepNum, dateValue?) => {
    // Use the passed dateValue or fall back to editedDueDate state
    const dueDateToSave = dateValue || data.editedDueDate;

    if (!dueDateToSave) {
      showAlert('Please select a due date.', 'Error');
      setEditingDueDate(null);
      return;
    }

    // Validate that the date is not in the past
    const selectedDate = new Date(dueDateToSave);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (selectedDate < today) {
      showAlert('Due date cannot be in the past. Please select a current or future date.', 'Error');
      setEditingDueDate(null);
      setEditedDueDate('');
      return;
    }

    try {
      const dueDateField = `step${stepNum}_due_date`;
      const { error } = await supabase
        .from('projects')
        .update({ [dueDateField]: dueDateToSave })
        .eq('project_id', project.project_id);

      if (error) {
        console.error('Error updating due date:', error.message);
        showAlert('Error updating due date. Please try again.', 'Error');
      } else {
        setProject({ ...project, [dueDateField]: dueDateToSave });
        setEditingDueDate(null);
        setEditedDueDate('');
      }
    } catch (error) {
      console.error('Error updating due date:', error);
      showAlert('Error updating due date. Please try again.', 'Error');
    }
  };

  const handleDueDateCancel = () => {
    setEditingDueDate(null);
    setEditedDueDate('');
  };

  return {
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDueDateEdit,
    handleDueDateSave,
    handleDueDateCancel,
  };
}
