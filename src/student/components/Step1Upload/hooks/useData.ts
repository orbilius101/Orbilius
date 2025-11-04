import { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';

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
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          navigate('/login');
          return;
        }

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('project_id, step1_status')
          .eq('student_id', session.user.id)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError.message);
          setErrorMsg('Error loading project data');
          return;
        }

        if (!projectData) {
          setErrorMsg('No project found. Please create a project first.');
          return;
        }

        const currentProjectId = projectData.project_id;
        setProjectId(currentProjectId);
        setStatus(projectData.step1_status || 'Not Submitted');

        const { data: projectStatus, error: statusError } = await supabase
          .from('projects')
          .select('step1_status')
          .eq('project_id', currentProjectId)
          .single();

        if (statusError) {
          console.error('Error fetching project status:', statusError.message);
        } else if (projectStatus) {
          setStatus(projectStatus.step1_status || 'Not Submitted');
        }

        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('teacher_comments')
          .eq('project_id', currentProjectId)
          .eq('step_number', 1)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (submissionError) {
          console.error('Error fetching submission:', submissionError.message);
        } else if (
          submissionData &&
          submissionData.length > 0 &&
          submissionData[0].teacher_comments
        ) {
          setTeacherComments(submissionData[0].teacher_comments);
        }
      } catch (err) {
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
