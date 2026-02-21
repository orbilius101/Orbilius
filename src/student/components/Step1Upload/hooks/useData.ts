import { useState, useEffect } from 'react';
import { auth } from '../../../../firebaseConfig';
import { getDocument, getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';

export function useStep1UploadData(navigate: any) {
  const [file, setFile] = useState(null);
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

        const { data: projectData, error: projectError } = await getDocument('projects', user.uid);

        if (projectError) {
          console.error('Error fetching project:', projectError.message);
          setErrorMsg('Error loading project data');
          return;
        }

        if (!projectData) {
          setErrorMsg('No project found. Please create a project first.');
          return;
        }

        const currentProjectId = (projectData as any).project_id;
        setProjectId(currentProjectId);
        setStatus((projectData as any).step1_status || 'Not Submitted');

        const { data: submissionDataArray, error: submissionError } = await getDocuments(
          'submissions',
          buildConstraints({
            eq: { project_id: currentProjectId, step_number: 1 },
            orderBy: { field: 'submitted_at', direction: 'desc' },
            limit: 1,
          })
        );

        if (submissionError) {
          console.error('Error fetching submission:', submissionError.message);
        } else if (
          submissionDataArray &&
          (submissionDataArray as any[]).length > 0 &&
          (submissionDataArray as any[])[0].teacher_comments
        ) {
          setTeacherComments((submissionDataArray as any[])[0].teacher_comments);
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
