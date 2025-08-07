import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function StepApproval() {
  const { projectId, stepNumber } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
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
        navigate('/');
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

      // Fetch submission file for this step
      const { data: fileData, error: fileError } = await supabase
        .from('submissions')
        .select('file_url, teacher_comments')
        .eq('project_id', projectId)
        .eq('step_number', stepNumber)
        .single();

      if (fileError) {
        console.error('Error fetching submission file:', fileError.message);
      } else if (fileData) {
        if (fileData.file_url) {
          setSubmissionFile(fileData.file_url);
        }
        if (fileData.teacher_comments) {
          setComment(fileData.teacher_comments);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [projectId, stepNumber, navigate]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    setIsSavingComment(true);

    try {
      // Try to save comment to the submissions table
      const { error } = await supabase
        .from('submissions')
        .update({ 
          teacher_comments: comment.trim(),
          comment_updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('step_number', parseInt(stepNumber));

      if (error) {
        console.error('Error saving comment:', error.message);
        // If the column doesn't exist, show a helpful message
        if (error.message.includes('teacher_comments')) {
          alert('Database needs to be updated to support teacher comments. Please contact the administrator.');
        } else {
          alert('Error saving comment. Please try again.');
        }
      } else {
        alert('Comment saved successfully!');
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
            teacher_comments: comment.trim(),
            comment_updated_at: new Date().toISOString()
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
            {submissionFile ? (
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
                  loading={<div style={styles.pdfLoading}>Loading PDF...</div>}
                  error={<div style={styles.pdfError}>Error loading PDF</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={600}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </>
            ) : (
              <div style={styles.noPdf}>No submission file found for this step.</div>
            )}
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
