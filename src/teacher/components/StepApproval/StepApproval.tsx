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
  ButtonGroup,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as FitIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
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
    scale,
    setScale,
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
      <Container maxWidth="xl">
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Review Step {stepNumber}: {getStepName(stepNumber)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', fontSize: '0.875rem' }}>
              <Typography variant="body2" color="text.primary">
                <strong>Student:</strong> {project.student?.first_name} {project.student?.last_name}
              </Typography>
              <Typography variant="body2" color="text.primary">
                <strong>Project:</strong> {project.project_title || 'Untitled Project'}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={2}>
            {submissionFile ? (
              <Box>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/teacher/dashboard')}
                      startIcon={<ArrowBackIcon />}
                      size="small"
                    >
                      Back to Dashboard
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber <= 1}
                        variant="outlined"
                        size="small"
                      >
                        Previous
                      </Button>
                      <Typography variant="body2">
                        Page {pageNumber} of {numPages || '--'}
                      </Typography>
                      <Button
                        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                        disabled={pageNumber >= numPages}
                        variant="outlined"
                        size="small"
                      >
                        Next
                      </Button>
                      <Box sx={{ ml: 2 }} />
                      <ButtonGroup size="small" variant="outlined">
                        <Button
                          onClick={() => setScale((prev) => Math.min(prev + 0.25, 3))}
                          disabled={scale >= 3}
                          startIcon={<ZoomInIcon />}
                        >
                          Zoom In
                        </Button>
                        <Button
                          onClick={() => setScale((prev) => Math.max(prev - 0.25, 0.5))}
                          disabled={scale <= 0.5}
                          startIcon={<ZoomOutIcon />}
                        >
                          Zoom Out
                        </Button>
                        <Button onClick={() => setScale(1)} startIcon={<FitIcon />}>
                          Fit
                        </Button>
                      </ButtonGroup>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {Math.round(scale * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      overflow: 'auto',
                      maxHeight: '65vh',
                      border: '1px solid',
                      borderColor: '#1e4976',
                      borderRadius: 1,
                      bgcolor: '#0a1929',
                      p: 2,
                    }}
                  >
                    <Document
                      file={submissionFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                    >
                      <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        scale={scale}
                      />
                    </Document>
                  </Box>
                </Stack>
              </Box>
            ) : youtubeLink ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  YouTube Link Submitted:
                </Typography>
                <Link href={youtubeLink} target="_blank" rel="noopener noreferrer">
                  {youtubeLink}
                </Link>
              </Box>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No submission found for this step</Typography>
              </Box>
            )}

            <Paper sx={{ p: 2, mt: 2 }}>
              <Stack spacing={2}>
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
