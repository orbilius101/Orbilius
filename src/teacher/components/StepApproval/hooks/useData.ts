import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebaseConfig';
import { getDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';
import { useAlert } from '../../../../hooks/useAlert';

export function useStepApprovalData() {
  const { projectId, stepNumber } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isApproving, setIsApproving] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      // Reset state at start
      setYoutubeLink(null);
      setSubmissionFile(null);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser as any);

      const { data: projectData, error: projectError } = await getDocument('projects', projectId!);

      if (projectError || !projectData) {
        console.error('Error fetching project:', projectError?.message);
        navigate('/teacher/dashboard');
        return;
      }

      // Get student data
      const { data: studentData } = await getDocument('users', (projectData as any).student_id);

      setProject({
        ...projectData,
        student: studentData,
      } as any);

      const { data: fileDataArray, error: fileError } = await getDocuments(
        'submissions',
        buildConstraints({
          eq: { project_id: projectId, step_number: Number(stepNumber) },
          orderBy: { field: 'submitted_at', direction: 'desc' },
          limit: 1,
        })
      );

      if (fileError) {
        console.error('Error fetching submission file:', fileError.message);
      } else if (fileDataArray && (fileDataArray as any[]).length > 0) {
        const latestSubmission = (fileDataArray as any[])[0];

        if (latestSubmission.youtube_link) {
          console.log('Setting YouTube link:', latestSubmission.youtube_link);
          setYoutubeLink(latestSubmission.youtube_link);
        } else {
          console.log('No YouTube link found in submission');
        }

        if (latestSubmission.file_url) {
          console.log('PDF file URL:', latestSubmission.file_url);
          // Firebase Storage URLs are already secured by storage rules
          setSubmissionFile(latestSubmission.file_url);
        }

        if (latestSubmission.teacher_comments) {
          setComment(latestSubmission.teacher_comments);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [projectId, stepNumber, navigate]);

  return {
    projectId,
    stepNumber,
    project,
    comment,
    setComment,
    submissionFile,
    youtubeLink,
    loading,
    numPages,
    setNumPages,
    pageNumber,
    setPageNumber,
    scale,
    setScale,
    isApproving,
    setIsApproving,
    isSavingComment,
    setIsSavingComment,
    navigate,
    alertState,
    showAlert,
    closeAlert,
  };
}
