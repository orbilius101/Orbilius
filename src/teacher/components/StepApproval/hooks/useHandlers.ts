import { supabase } from '../../../../supabaseClient';

export function useStepApprovalHandlers(data: any) {
  const {
    projectId,
    stepNumber,
    comment,
    setIsSavingComment,
    setIsApproving,
    navigate,
    showAlert,
  } = data;

  const onDocumentLoadSuccess = ({ numPages }) => {
    data.setNumPages(numPages);
    console.log('PDF loaded successfully, pages:', numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
  };

  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    setIsSavingComment(true);

    try {
      const { error: commentError } = await supabase
        .from('submissions')
        .update({
          teacher_comments: comment.trim(),
        })
        .eq('project_id', projectId)
        .eq('step_number', parseInt(stepNumber));

      if (commentError) {
        console.error('Error saving comment:', commentError.message);
        if (commentError.message.includes('teacher_comments')) {
          showAlert(
            'Database needs to be updated to support teacher comments. Please contact the administrator.',
            'Error'
          );
        } else {
          showAlert('Error saving comment. Please try again.', 'Error');
        }
        setIsSavingComment(false);
        return;
      }

      const currentStepStatusField = `step${stepNumber}_status`;
      const updateData = {
        [currentStepStatusField]: 'In Progress',
        current_step: parseInt(stepNumber),
      };

      const { error: statusError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId);

      if (statusError) {
        console.error('Error updating project status:', statusError.message);
        showAlert('Comment saved, but error updating status. Please try again.', 'Error');
      } else {
        showAlert(
          'Comment saved and step set back to In Progress. Student can now see feedback and resubmit.',
          'Success'
        );
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      showAlert('Error saving comment. Please try again.', 'Error');
    }

    setIsSavingComment(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      if (comment.trim()) {
        const { error: commentError } = await supabase
          .from('submissions')
          .update({
            teacher_comments: comment.trim(),
          })
          .eq('project_id', projectId)
          .eq('step_number', parseInt(stepNumber));

        if (commentError) {
          console.error('Error saving comment:', commentError.message);
        }
      }

      const currentStepStatusField = `step${stepNumber}_status`;
      const updateData: any = {
        [currentStepStatusField]: 'Approved',
      };

      if (parseInt(stepNumber) === 5) {
        updateData.submitted_to_orbilius = true;
      }

      if (parseInt(stepNumber) < 5) {
        const nextStep = parseInt(stepNumber) + 1;
        const nextStepStatusField = `step${nextStep}_status`;
        updateData.current_step = nextStep;
        updateData[nextStepStatusField] = 'In Progress';
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId);

      if (updateError) {
        console.error('Error updating project:', updateError.message);
        showAlert('Error approving step. Please try again.', 'Error');
      } else {
        showAlert('Step approved successfully!', 'Success');
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      console.error('Error approving step:', error);
      showAlert('Error approving step. Please try again.', 'Error');
    }

    setIsApproving(false);
  };

  const getStepName = (stepNum) => {
    const stepNames = {
      1: 'Initial Research',
      2: 'Design Brief',
      3: 'Planning',
      4: 'Implementation',
      5: 'Archival Records',
    };
    return stepNames[stepNum] || 'Unknown';
  };

  return {
    onDocumentLoadSuccess,
    onDocumentLoadError,
    handleSaveComment,
    handleApprove,
    getStepName,
  };
}
