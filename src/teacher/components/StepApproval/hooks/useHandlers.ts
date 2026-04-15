import { updateDocument } from '../../../../utils/firebaseHelpers';

export function useStepApprovalHandlers(data: any) {
  const {
    projectId,
    stepNumber,
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
    // Don't clear submissionFile here — pdfjs can fire worker errors during re-renders
    // even after a successful load. Only log/alert; keep the viewer visible.
    showAlert(
      'Could not preview the submitted file. Use the download link to view it.',
      'Preview Unavailable'
    );
  };

  const handleSaveComment = async () => {
    setIsSavingComment(true);

    try {
      const currentStepStatusField = `step${stepNumber}_status`;
      const updateData = {
        [currentStepStatusField]: 'Revision Requested',
        current_step: parseInt(stepNumber),
      };

      const { error: statusError } = await updateDocument('projects', projectId, updateData);

      if (statusError) {
        console.error('Error updating project status:', statusError.message);
        showAlert('Error updating status. Please try again.', 'Error');
      } else {
        showAlert(
          'Revision requested. Student will see your feedback and can resubmit.',
          'Success'
        );
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      showAlert('Error updating status. Please try again.', 'Error');
    }

    setIsSavingComment(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
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

      const { error: updateError } = await updateDocument('projects', projectId, updateData);

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
