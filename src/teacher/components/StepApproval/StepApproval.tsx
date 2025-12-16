import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  CircularProgress,
  Link,
} from '@mui/material';
import { useStepApprovalData } from './hooks/useData';
import { useStepApprovalHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';

// Use CDN that matches installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StepApproval() {
  const data = useStepApprovalData();
  const handlers = useStepApprovalHandlers(data);

  const {
    loading,
    project,
    submissionFile,
    youtubeLink,
    comment,
    setComment,
    numPages,
    pageNumber,
    setPageNumber,
    isApproving,
    isSavingComment,
    stepNumber,
    navigate,
    alertState,
    closeAlert,
  } = data;

  const {
    onDocumentLoadSuccess,
    onDocumentLoadError,
    handleSaveComment,
    handleApprove,
    getStepName,
  } = handlers;

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <Typography color="error">Project not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Review Step {stepNumber}: {getStepName(stepNumber)}
            </Typography>
            <Typography variant="body1">
              Project: {project.project_title || 'Untitled Project'}
            </Typography>
            <Typography variant="body1">
              Student: {project.student?.first_name} {project.student?.last_name}
            </Typography>
          </Box>

          <Stack spacing={3}>
            {submissionFile ? (
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}
                  >
                    <Button
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                      variant="outlined"
                    >
                      Previous
                    </Button>
                    <Typography>
                      Page {pageNumber} of {numPages || '--'}
                    </Typography>
                    <Button
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                      variant="outlined"
                    >
                      Next
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                    <Document
                      file={submissionFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                    >
                      <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </Box>
                </Stack>
              </Paper>
            ) : youtubeLink ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  YouTube Link Submitted:
                </Typography>
                <Link href={youtubeLink} target="_blank" rel="noopener noreferrer">
                  {youtubeLink}
                </Link>
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography>No submission found for this step</Typography>
              </Paper>
            )}

            <Paper sx={{ p: 3 }}>
              <Stack spacing={3}>
                <TextField
                  label="Teacher Comments (Optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter comments for the student..."
                  multiline
                  rows={4}
                  fullWidth
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/teacher/dashboard')}>
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSaveComment}
                    disabled={!comment.trim() || isSavingComment}
                  >
                    {isSavingComment ? 'Saving...' : 'Save Comment & Return to Student'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleApprove}
                    disabled={isApproving}
                    color="success"
                  >
                    {isApproving ? 'Approving...' : 'Approve Step'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Container>
      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </Box>
  );
}
