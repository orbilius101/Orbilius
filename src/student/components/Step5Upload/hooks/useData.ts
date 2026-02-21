import { useState, useEffect } from 'react';
import { auth } from '../../../../firebaseConfig';
import { getDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';

export function useStep5UploadData(navigate: any) {
  const [file, setFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [teacherComments, setTeacherComments] = useState('Waiting for feedback...');
  const [status, setStatus] = useState('Not Submitted');
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          navigate('/login');
          return;
        }

        const { data: projectDataArray, error: projectError } = await getDocuments(
          'projects',
          buildConstraints({
            eq: { student_id: user.uid },
            limit: 1,
          })
        );

        if (projectError || !(projectDataArray as any[])?.length) {
          console.error('Error fetching project:', projectError?.message);
          setErrorMsg('Error loading project data');
          return;
        }

        const projectData = (projectDataArray as any[])[0];
        const currentProjectId = projectData.project_id;
        setProjectId(currentProjectId);
        setStatus(projectData.step5_status || 'Not Submitted');

        const { data: submissionDataArray, error: submissionError } = await getDocuments(
          'submissions',
          buildConstraints({
            eq: { project_id: currentProjectId, step_number: 5 },
            limit: 1,
          })
        );

        if (submissionError) {
          console.error('Error fetching submission:', submissionError.message);
        } else if (submissionDataArray && (submissionDataArray as any[]).length > 0) {
          const submissionData = (submissionDataArray as any[])[0];
          if (submissionData.teacher_comments) {
            setTeacherComments(submissionData.teacher_comments);
          }
          if (submissionData.youtube_link) {
            setYoutubeLink(submissionData.youtube_link);
          }
        }
      } catch (err: any) {
        console.error('Error fetching existing data:', err.message);
        setErrorMsg('Error loading data');
      }
    };

    fetchExistingData();
  }, [navigate]);

  return {
    file,
    setFile,
    youtubeLink,
    setYoutubeLink,
    uploading,
    setUploading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    teacherComments,
    status,
    setStatus,
    projectId,
  };
}
