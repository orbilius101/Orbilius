import { MutableRefObject, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../firebaseConfig';
import { getDocuments, buildConstraints } from '../../../../utils/firebaseHelpers';

export function useStep1UploadData() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef: MutableRefObject<number> = useRef(0);
  const justDroppedRef: MutableRefObject<boolean> = useRef(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [teacherComments, setTeacherComments] = useState('Waiting for feedback...');
  const [status, setStatus] = useState('Not Submitted');
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingData = async () => {
      setLoading(true);
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

        if (projectError) {
          console.error('Error fetching project:', projectError.message);
          setErrorMsg('Error loading project data: ' + projectError.message);
          setLoading(false);
          return;
        }

        if (!(projectDataArray as any[])?.length) {
          console.error('No project found for user:', user.uid);
          setErrorMsg('No project found. Please create a project first.');
          setLoading(false);
          return;
        }

        const projectData = (projectDataArray as any[])[0];
        // Use 'id' field which is the document ID in Firestore
        const currentProjectId = projectData.id;

        if (!currentProjectId) {
          console.error('Step1Upload - project id is missing from project data!');
          setErrorMsg('Project ID not found. Please contact support.');
          setLoading(false);
          return;
        }

        setProjectId(currentProjectId);
        setStatus(projectData.step1_status || 'Not Submitted');

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

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching existing data:', err.message);
        setErrorMsg('Error loading data: ' + err.message);
        setLoading(false);
      }
    };

    fetchExistingData();
  }, [navigate]);

  return {
    navigate,
    isDragging,
    setIsDragging,
    dragCounterRef,
    justDroppedRef,
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
    loading,
  };
}
