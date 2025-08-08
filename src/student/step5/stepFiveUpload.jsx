import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Step5UploadPage() {
  const navigate = useNavigate();
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
          .select('project_id, step5_status')
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
        setStatus(projectData.step5_status || 'Not Submitted');

        // Fetch submission data including teacher comments and YouTube link
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('teacher_comments, youtube_link')
          .eq('project_id', currentProjectId)
          .eq('step_number', 5)
          .single();

        if (submissionError) {
          console.error('Error fetching submission:', submissionError.message);
        } else if (submissionData) {
          if (submissionData.teacher_comments) {
            setTeacherComments(submissionData.teacher_comments);
          }
          if (submissionData.youtube_link) {
            setYoutubeLink(submissionData.youtube_link);
          }
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

  const handleYoutubeLinkChange = (e) => {
    setYoutubeLink(e.target.value);
  };

  const handleSubmit = async () => {
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
      if (!youtubeLink.trim()) throw new Error('Please provide a YouTube link.');

      const fileExt = file.name.split('.').pop().toLowerCase();
      const filePath = `submissions/${projectId}/${userId}_${Date.now()}.${fileExt}`;

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
        step_number: 5,
        file_url: fileUrl,
        youtube_link: youtubeLink.trim(),
      });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_step_status: 'Submitted',
          step5_status: 'Submitted',

        })
        .eq('project_id', projectId);

      if (updateError) throw updateError;

      setSuccess(true);
      setStatus('Submitted');
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <button 
          onClick={() => navigate('/student/dashboard')} 
          style={styles.backButton}
        >
          ← Back to Dashboard
        </button>
        
        <h2 style={styles.title}>Project Cycle Phases<br />Step 5: Closeout the Project!</h2>
        <p style={styles.paragraph}>
          This is it. You're almost done! Please make sure that your file is in PDF format and upload the document by clicking the button. After your teacher approves this step, you will be able to access Step 5.
        </p>

        {status !== 'Submitted' && status !== 'Approved' ? (
          <>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={styles.fileInput}
            />

            <div style={styles.youtubeLinkSection}>
              <p style={styles.sectionLabel}><strong>Insert Project YouTube Video Link:</strong></p>
              <input
                type="url"
                value={youtubeLink}
                onChange={handleYoutubeLinkChange}
                placeholder="https://www.youtube.com/watch?v=..."
                style={styles.youtubeInput}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading || !file || !youtubeLink.trim()}
              style={{
                ...styles.submitButton,
                ...(uploading || !file || !youtubeLink.trim() ? styles.submitButtonDisabled : {})
              }}
            >
              {uploading ? 'Uploading...' : 'Submit!!!'}
            </button>
          </>
        ) : (
          <div style={styles.submittedMessage}>
            <p style={styles.submittedText}>
              ✅ Your submission has been uploaded and is {status === 'Approved' ? 'approved' : 'awaiting teacher review'}.
            </p>
            {youtubeLink && (
              <p style={styles.submittedText}>
                <strong>YouTube Link:</strong> <a href={youtubeLink} target="_blank" rel="noopener noreferrer" style={styles.link}>{youtubeLink}</a>
              </p>
            )}
          </div>
        )}

        {success && <p style={styles.successMessage}>Submission successful!</p>}
        {errorMsg && <p style={styles.errorMessage}>{errorMsg}</p>}

        <div style={styles.statusSection}>
          <p style={styles.sectionLabel}><strong>Step 5: Closeout Status</strong></p>
          <input type="text" style={styles.input} disabled value={status} />

          <p style={styles.sectionLabel}><strong>Teacher Comments:</strong></p>
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
  youtubeLinkSection: {
    marginBottom: '2rem',
  },
  youtubeInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #ccc',
    borderRadius: '8px',
    fontSize: '18px',
    maxWidth: '600px',
  },
  submitButton: {
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
  submitButtonDisabled: {
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
  link: {
    color: '#007bff',
    textDecoration: 'underline',
  },
};
