import { updateDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';

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

    // Parse error message to show user-friendly information
    let errorMessage = 'Unable to load the PDF file.';
    let errorTitle = 'File Not Found';

    if (error && typeof error === 'object') {
      // Check for 404 or not found errors
      if (
        error.statusCode === '404' ||
        error.error === 'not_found' ||
        error.message === 'Object not found'
      ) {
        errorMessage = 'The submitted file could not be found. It may have been deleted or moved.';
        errorTitle = 'File Not Found';
      } else if (error.message) {
        errorMessage = `Error loading PDF: ${error.message}`;
        errorTitle = 'Error Loading File';
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    showAlert(errorMessage, errorTitle);
  };

  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    setIsSavingComment(true);

    try {
      // Find the submission document
      const { data: submissions } = await getDocuments(
        'submissions',
        buildConstraints({
          eq: { project_id: projectId, step_number: parseInt(stepNumber) },
        })
      );

      if (submissions && (submissions as any[]).length > 0) {
        const submissionId = (submissions as any[])[0].id;
        const { error: commentError } = await updateDocument('submissions', submissionId, {
          teacher_comments: comment.trim(),
        });

        if (commentError) {
          console.error('Error saving comment:', commentError.message);
          showAlert('Error saving comment. Please try again.', 'Error');
          setIsSavingComment(false);
          return;
        }
      }

      const currentStepStatusField = `step${stepNumber}_status`;
      const updateData = {
        [currentStepStatusField]: 'In Progress',
        current_step: parseInt(stepNumber),
      };

      const { error: statusError } = await updateDocument('projects', projectId, updateData);

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
        // Find the submission document
        const { data: submissions } = await getDocuments(
          'submissions',
          buildConstraints({
            eq: { project_id: projectId, step_number: parseInt(stepNumber) },
          })
        );

        if (submissions && (submissions as any[]).length > 0) {
          const submissionId = (submissions as any[])[0].id;
          const { error: commentError } = await updateDocument('submissions', submissionId, {
            teacher_comments: comment.trim(),
          });

          if (commentError) {
            console.error('Error saving comment:', commentError.message);
          }
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
