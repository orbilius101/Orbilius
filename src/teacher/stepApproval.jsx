import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker to match react-pdf version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;

export default function StepApproval() {
  const { projectId, stepNumber } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isApproving, setIsApproving] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);

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

      // Fetch project details
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

      // Fetch the most recent submission file for this step
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
        
        // Check if this is step 5 and if there's a YouTube link
        if (parseInt(stepNumber) === 5 && latestSubmission.youtube_link) {
          setYoutubeLink(latestSubmission.youtube_link);
        }
        
        // Handle regular file upload (for any step that has a file_url)
        if (latestSubmission.file_url) {
          console.log('Original PDF file URL:', latestSubmission.file_url); // Debug log
          
          // Try to get a signed URL for better access
          try {
            // Extract the file path from the public URL
            const urlParts = latestSubmission.file_url.split('/storage/v1/object/public/student-submissions/');
            if (urlParts.length > 1) {
              const filePath = urlParts[1];
              console.log('File path:', filePath); // Debug log
              
              // Get a signed URL for authenticated access
              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('student-submissions')
                .createSignedUrl(filePath, 3600); // 1 hour expiry
              
              if (signedUrlError) {
                console.error('Error creating signed URL:', signedUrlError);
                setSubmissionFile(latestSubmission.file_url); // Fall back to public URL
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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    console.log('PDF loaded successfully, pages:', numPages); // Debug log
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
  };

  // Memoize the PDF viewer to prevent unnecessary re-renders when comment changes
  const pdfViewer = useMemo(() => {
    // For step 5, show YouTube link instead of PDF if available
    if (parseInt(stepNumber) === 5 && youtubeLink) {
      return (
        <div style={styles.youtubeContainer}>
          <h3 style={styles.youtubeTitle}>Student Submission (YouTube Video)</h3>
          <div style={styles.youtubeLink}>
            <a 
              href={youtubeLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.linkButton}
            >
              🎬 Open YouTube Video
            </a>
            <p style={styles.linkText}>{youtubeLink}</p>
          </div>
        </div>
      );
    }

    if (!submissionFile) {
      return <div style={styles.noPdf}>No submission file found for this step.</div>;
    }

    return (
      <>
        <div style={styles.pdfControls}>
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
            style={styles.pageButton}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {pageNumber} of {numPages || '?'}
          </span>
          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
            style={styles.pageButton}
          >
            Next
          </button>
        </div>
        <Document
          file={submissionFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div style={styles.pdfLoading}>Loading PDF...</div>}
          error={<div style={styles.pdfError}>Error loading PDF. Please check if the file exists and is accessible.</div>}
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/cmaps/',
            cMapPacked: true,
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            width={600}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </>
    );
  }, [submissionFile, youtubeLink, stepNumber, pageNumber, numPages]); // Include youtubeLink and stepNumber in dependencies

  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    setIsSavingComment(true);

    try {
      // Save comment to the submissions table
      const { error: commentError } = await supabase
        .from('submissions')
        .update({ 
          teacher_comments: comment.trim()
        })
        .eq('project_id', projectId)
        .eq('step_number', parseInt(stepNumber));

      if (commentError) {
        console.error('Error saving comment:', commentError.message);
        // If the column doesn't exist, show a helpful message
        if (commentError.message.includes('teacher_comments')) {
          alert('Database needs to be updated to support teacher comments. Please contact the administrator.');
        } else {
          alert('Error saving comment. Please try again.');
        }
        setIsSavingComment(false);
        return;
      }

      // Set the step status back to "In Progress" so student can resubmit
      const currentStepStatusField = `step${stepNumber}_status`;
      const updateData = {
        [currentStepStatusField]: 'In Progress',
        current_step: parseInt(stepNumber), // Ensure current step is set back to this step
      };

      const { error: statusError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId);

      if (statusError) {
        console.error('Error updating project status:', statusError.message);
        alert('Comment saved, but error updating status. Please try again.');
      } else {
        alert('Comment saved and step set back to In Progress. Student can now see feedback and resubmit.');
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Error saving comment. Please try again.');
    }

    setIsSavingComment(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      // First save the comment if there is one
      if (comment.trim()) {
        const { error: commentError } = await supabase
          .from('submissions')
          .update({ 
            teacher_comments: comment.trim()
          })
          .eq('project_id', projectId)
          .eq('step_number', parseInt(stepNumber));

        if (commentError) {
          console.error('Error saving comment:', commentError.message);
        }
      }

      // Update the step status to "Approved"
      const currentStepStatusField = `step${stepNumber}_status`;
      const updateData = {
        [currentStepStatusField]: 'Approved',
      };

      // If this is not step 5, advance to the next step
      if (parseInt(stepNumber) < 5) {
        const nextStep = parseInt(stepNumber) + 1;
        const nextStepStatusField = `step${nextStep}_status`;
        updateData.current_step = nextStep;
        updateData[nextStepStatusField] = 'In Progress';
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId);

      if (updateError) {
        console.error('Error updating project:', updateError.message);
        alert('Error approving step. Please try again.');
      } else {
        alert('Step approved successfully!');
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      console.error('Error approving step:', error);
      alert('Error approving step. Please try again.');
    }

    setIsApproving(false);
  };

  const getStepName = (stepNum) => {
    const stepNames = {
      1: 'Initial Research',
      2: 'Design Brief',
      3: 'Planning',
      4: 'Implementation',
      5: 'Archival Records'
    };
    return stepNames[stepNum] || 'Unknown';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Project not found.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Step Approval Page</h1>
        <button 
          onClick={() => navigate('/teacher/dashboard')} 
          style={styles.backButton}
        >
          Return to Teacher Dashboard
        </button>
      </div>

      <div style={styles.projectInfo}>
        <h2 style={styles.projectTitle}>
          {project.first_name} {project.last_name} - Step {stepNumber}: {getStepName(parseInt(stepNumber))}
        </h2>
        <p style={styles.projectSubtitle}>
          Project: {project.project_title}
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.leftPanel}>
          <div style={styles.pdfContainer}>
            {pdfViewer}
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.commentSection}>
            <h3 style={styles.commentTitle}>Teacher Comments</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comments here..."
              style={styles.commentTextarea}
              rows={10}
            />
            <div style={styles.buttonGroup}>
              <button
                onClick={handleSaveComment}
                disabled={!comment.trim() || isSavingComment}
                style={styles.enterButton}
              >
                {isSavingComment ? 'Saving...' : 'Enter'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                style={styles.approveButton}
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#111111',
    minHeight: '100vh',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    maxWidth: '1400px',
    margin: '0 auto 2rem auto',
  },
  title: {
    fontSize: '36px',
    margin: 0,
  },
  backButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  projectInfo: {
    maxWidth: '1400px',
    margin: '0 auto 2rem auto',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  projectTitle: {
    fontSize: '24px',
    margin: '0 0 0.5rem 0',
  },
  projectSubtitle: {
    fontSize: '18px',
    margin: 0,
    color: '#666',
  },
  content: {
    display: 'flex',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  leftPanel: {
    flex: 1,
  },
  rightPanel: {
    width: '400px',
  },
  pdfContainer: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
  },
  pdfControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '4px',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  pageInfo: {
    fontSize: '14px',
    fontWeight: '500',
  },
  pdfLoading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '18px',
  },
  pdfError: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '18px',
    color: '#dc3545',
  },
  noPdf: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '18px',
    color: '#666',
  },
  youtubeContainer: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  youtubeTitle: {
    fontSize: '20px',
    marginBottom: '1.5rem',
    color: '#111111',
  },
  youtubeLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  linkButton: {
    display: 'inline-block',
    padding: '1rem 2rem',
    backgroundColor: '#ff0000',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  },
  linkText: {
    fontSize: '14px',
    color: '#666',
    wordBreak: 'break-all',
    maxWidth: '500px',
    margin: 0,
  },
  commentSection: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    height: 'fit-content',
  },
  commentTitle: {
    fontSize: '20px',
    marginBottom: '1rem',
  },
  commentTextarea: {
    width: '100%',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    resize: 'vertical',
    marginBottom: '1rem',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
  },
  enterButton: {
    flex: 1,
    padding: '0.8rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  approveButton: {
    flex: 1,
    padding: '0.8rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  loading: {
    textAlign: 'center',
    fontSize: '24px',
    padding: '3rem',
  },
  error: {
    textAlign: 'center',
    fontSize: '24px',
    padding: '3rem',
    color: '#dc3545',
  },
};
