import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabaseClient';
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
  const [isApproving, setIsApproving] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        navigate('/login');
        return;
      }

      setUser(session.user);

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError.message);
        navigate('/teacher/dashboard');
        return;
      }

      setProject(projectData);

      const { data: fileData, error: fileError } = await supabase
        .from('submissions')
        .select('file_url, teacher_comments, submitted_at, youtube_link')
        .eq('project_id', projectId)
        .eq('step_number', stepNumber)
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (fileError) {
        console.error('Error fetching submission file:', fileError.message);
      } else if (fileData && fileData.length > 0) {
        const latestSubmission = fileData[0];

        if (parseInt(stepNumber) === 5 && latestSubmission.youtube_link) {
          setYoutubeLink(latestSubmission.youtube_link);
        }

        if (latestSubmission.file_url) {
          console.log('Original PDF file URL:', latestSubmission.file_url);

          try {
            const urlParts = latestSubmission.file_url.split(
              '/storage/v1/object/public/student-submissions/'
            );
            if (urlParts.length > 1) {
              const filePath = urlParts[1];
              console.log('File path:', filePath);

              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('student-submissions')
                .createSignedUrl(filePath, 3600);

              if (signedUrlError) {
                console.error('Error creating signed URL:', signedUrlError);
                setSubmissionFile(latestSubmission.file_url);
              } else {
                console.log('Using signed URL:', signedUrlData.signedUrl);
                setSubmissionFile(signedUrlData.signedUrl);
              }
            } else {
              setSubmissionFile(latestSubmission.file_url);
            }
          } catch (error) {
            console.error('Error processing file URL:', error);
            setSubmissionFile(latestSubmission.file_url);
          }
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
