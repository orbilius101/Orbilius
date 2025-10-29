import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { generateSubmissionFilePath, getFileExtension } from '../../utils/filePathHelpers';

export default function Step3UploadPage() {
  const navigate = useNavigate();
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
        // First get the current user's session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          navigate('/login');
          return;
        }

        // Fetch the user's project to get projectId
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('project_id, step3_status')
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
        setStatus(projectData.step3_status || 'Not Submitted');

        // Fetch submission data including teacher comments
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('teacher_comments')
          .eq('project_id', currentProjectId)
          .eq('step_number', 3)
          .single();

        if (submissionError) {
          console.error('Error fetching submission:', submissionError.message);
        } else if (submissionData && submissionData.teacher_comments) {
          setTeacherComments(submissionData.teacher_comments);
        }
      } catch (err) {
        console.error('Error fetching existing data:', err.message);
        setErrorMsg('Error loading data');
      }
    };

    fetchExistingData();
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!projectId) {
      setErrorMsg('Project not loaded. Please try refreshing the page.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) throw new Error('Not authenticated.');

      const userId = session.user.id;

      if (!file) throw new Error('Please select a file.');

      const fileExt = getFileExtension(file.name);
      const filePath = generateSubmissionFilePath(userId, projectId, 3, fileExt);

      const { error: uploadError } = await supabase.storage
        .from('student-submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('student-submissions')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('submissions').insert({
        project_id: projectId,
        uploaded_by: userId,
        step_number: 3,
        file_url: fileUrl,
      });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_step_status: 'Submitted',
          step3_status: 'Submitted',
        })
        .eq('project_id', projectId);

      if (updateError) throw updateError;

      setSuccess(true);
      setStatus('Submitted');
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <button onClick={() => navigate('/student/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>

        <h2 style={styles.title}>
          Project Cycle Phases
          <br />
          Step 3: Planning Docs
        </h2>
        <p style={styles.paragraph}>
          Congrats on completing your design brief! Please make sure that your file is in PDF format
          and upload the document by clicking the button. After your teacher approves this step, you
          will be able to access Step 4.
        </p>

        {status !== 'Submitted' && status !== 'Approved' ? (
          <>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={styles.fileInput}
            />

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              style={{
                ...styles.uploadButton,
                ...(uploading || !file ? styles.uploadButtonDisabled : {}),
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Planning Docs Here'}
            </button>
          </>
        ) : (
          <div style={styles.submittedMessage}>
            <p style={styles.submittedText}>
              ✅ Your submission has been uploaded and is{' '}
              {status === 'Approved' ? 'approved' : 'awaiting teacher review'}.
            </p>
          </div>
        )}

        {success && <p style={styles.successMessage}>Upload successful!</p>}
        {errorMsg && <p style={styles.errorMessage}>{errorMsg}</p>}

        <div style={styles.statusSection}>
          <p style={styles.sectionLabel}>
            <strong>Step 3: Planning Status</strong>
          </p>
          <input type="text" style={styles.input} disabled value={status} />

          <p style={styles.sectionLabel}>
            <strong>Teacher Comments:</strong>
          </p>
          <textarea style={styles.textarea} disabled value={teacherComments} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#ffffff',
    color: '#111111',
    minHeight: '100vh',
    padding: '4rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '48px',
    marginBottom: '2.5rem',
    lineHeight: '1.2',
    color: '#111111',
  },
  paragraph: {
    fontSize: '22px',
    lineHeight: '1.6',
    marginBottom: '2rem',
    color: '#333333',
  },
  fileInput: {
    marginTop: '2rem',
    marginBottom: '2rem',
    display: 'block',
    fontSize: '18px',
    padding: '1rem',
    border: '2px solid #ccc',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
  },
  uploadButton: {
    marginTop: '1rem',
    padding: '1.5rem 2.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    color: '#666',
  },
  successMessage: {
    color: 'green',
    marginTop: '1.5rem',
    fontSize: '20px',
    fontWeight: '500',
  },
  errorMessage: {
    color: 'red',
    marginTop: '1.5rem',
    fontSize: '20px',
    fontWeight: '500',
  },
  statusSection: {
    marginTop: '3rem',
    width: '100%',
  },
  sectionLabel: {
    fontSize: '20px',
    marginBottom: '1rem',
    marginTop: '2rem',
    color: '#333333',
  },
  input: {
    width: '100%',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    fontSize: '18px',
    maxWidth: '500px',
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    fontSize: '18px',
    maxWidth: '800px',
    resize: 'vertical',
  },
  backButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#f8f9fa',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '2rem',
    color: '#495057',
    transition: 'all 0.2s',
  },
  submittedMessage: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    padding: '2rem',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  submittedText: {
    fontSize: '18px',
    color: '#155724',
    margin: '0.5rem 0',
  },
};
