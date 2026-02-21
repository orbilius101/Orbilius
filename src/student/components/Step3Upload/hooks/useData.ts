import { useState, useEffect } from 'react';
import { auth } from '../../../../firebaseConfig';
import { getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';

export function useStep3UploadData(navigate: any) {
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

        const { data: projectDataArray, error: projectError } = await getDocuments(
          'projects',
          buildConstraints({ eq: { student_id: user.uid }, limit: 1 })
        );

        if (projectError || !(projectDataArray as any[])?.length) {
          console.error('Error fetching project:', projectError?.message);
          setErrorMsg('Error loading project data');
          return;
        }

        const projectData = (projectDataArray as any[])[0];
        const currentProjectId = projectData.project_id;
        setProjectId(currentProjectId);
        setStatus(projectData.step3_status || 'Not Submitted');

        const { data: submissionDataArray, error: submissionError } = await getDocuments(
          'submissions',
          buildConstraints({
            eq: { project_id: currentProjectId, step_number: 3 },
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
