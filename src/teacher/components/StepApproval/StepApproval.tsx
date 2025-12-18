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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as FitIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useStepApprovalData } from './hooks/useData';
import { useStepApprovalHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';

// Use CDN that matches installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StepApproval() {
  const [showYouTubePlayer, setShowYouTubePlayer] = React.useState<boolean>(false);

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

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

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
            {submissionFile && (
              <Box>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
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
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flex: 1,
                        justifyContent: 'center',
                      }}
                    >
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
                    {youtubeLink && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowYouTubePlayer(true)}
                        startIcon={<PlayArrowIcon />}
                        size="small"
                      >
                        Watch Video
                      </Button>
                    )}
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
            )}

            {!submissionFile && !youtubeLink && (
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

      {/* YouTube Video Modal */}
      <Dialog
        open={showYouTubePlayer}
        onClose={() => setShowYouTubePlayer(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">YouTube Video Submission</Typography>
            <IconButton onClick={() => setShowYouTubePlayer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              width: '100%',
              borderRadius: 1,
              bgcolor: '#000',
            }}
          >
            {youtubeLink && extractYouTubeVideoId(youtubeLink) ? (
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(youtubeLink)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography color="error">Invalid YouTube URL</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowYouTubePlayer(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </Box>
  );
}
