import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Container,
  Typography,
  Button,
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
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useStepApprovalData } from './hooks/useData';
import { useStepApprovalHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';
import CommentThread from '../../../components/CommentThread/CommentThread';
import type { CommentThreadHandle } from '../../../components/CommentThread/CommentThread';
import SubmissionHistory from '../../../components/SubmissionHistory/SubmissionHistory';

// Use CDN that matches installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Memoized PDF viewer — prevents re-renders when parent state (e.g. comment) changes
const PdfViewer = React.memo(function PdfViewer({
  file,
  scale,
  pageNumber,
  pdfVersion,
  onLoadSuccess,
  onLoadError,
  onRenderSuccess,
}: {
  file: string;
  scale: number;
  pageNumber: number;
  pdfVersion: string;
  onLoadSuccess: (pdf: any) => void;
  onLoadError: (err: any) => void;
  onRenderSuccess: (page: any) => void;
}) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      options={{
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfVersion}/cmaps/`,
        cMapPacked: true,
      }}
    >
      <Page
        pageNumber={pageNumber}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        scale={scale}
        onRenderSuccess={onRenderSuccess}
      />
    </Document>
  );
});

export default function StepApproval() {
  const [showYouTubePlayer, setShowYouTubePlayer] = React.useState<boolean>(false);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const commentThreadRef = useRef<CommentThreadHandle>(null);
  const pdfPageWidthRef = useRef<number>(612);
  const pdfPageHeightRef = useRef<number>(792);

  // Poll the popup window to detect when it's closed
  useEffect(() => {
    if (!isPoppedOut) return;
    const interval = setInterval(() => {
      if (popupRef.current?.closed) {
        setIsPoppedOut(false);
        popupRef.current = null;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPoppedOut]);

  const data = useStepApprovalData();
  const handlers = useStepApprovalHandlers(data);

  const {
    loading,
    project,
    submissionFile,
    submissionDownloadUrl,
    youtubeLink,
    numPages,
    pageNumber,
    setPageNumber,
    scale,
    setScale,
    isApproving,
    isSavingComment,
    stepNumber,
    projectId,
    navigate,
    alertState,
    closeAlert,
  } = data;

  const [navigateOnClose, setNavigateOnClose] = useState(false);

  const { handleSaveComment, handleApprove, getStepName } = handlers;

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    data.setNumPages(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDocumentLoadError = useCallback((error: any) => {
    console.error('PDF load error:', error);
  }, []);

  const handleFitPage = useCallback(() => {
    if (!containerRef.current) {
      setScale(1);
      return;
    }
    const containerWidth = containerRef.current.clientWidth - 32; // subtract p:2 padding
    const containerHeight = containerRef.current.clientHeight - 32;
    const widthScale = containerWidth / pdfPageWidthRef.current;
    const heightScale = containerHeight / pdfPageHeightRef.current;
    const fitScale = Math.min(widthScale, heightScale);
    setScale(Math.round(fitScale * 100) / 100);
  }, [setScale]);

  const handlePageRenderSuccess = useCallback((page: any) => {
    if (page?.originalWidth) pdfPageWidthRef.current = page.originalWidth;
    if (page?.originalHeight) pdfPageHeightRef.current = page.originalHeight;
  }, []);

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
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, py: 2 }}
      >
        <Stack spacing={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Header */}
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
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

          <Stack
            spacing={1}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            {submissionFile && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Stack
                  spacing={1}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
                >
                  {/* Toolbar */}
                  <Box
                    sx={{
                      flexShrink: 0,
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
                        <Button onClick={handleFitPage} startIcon={<FitIcon />}>
                          Fit
                        </Button>
                      </ButtonGroup>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {Math.round(scale * 100)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => {
                          const popup = window.open(
                            submissionFile as string,
                            '_blank',
                            'width=900,height=700'
                          );
                          if (popup) {
                            popupRef.current = popup;
                            setIsPoppedOut(true);
                          }
                        }}
                      >
                        Pop Out
                      </Button>
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
                  </Box>

                  {/* PDF viewer */}
                  {isPoppedOut ? (
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: '#1e4976',
                        borderRadius: 1,
                        bgcolor: '#0a1929',
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body2">PDF opened in separate window</Typography>
                    </Box>
                  ) : (
                    <Box
                      ref={containerRef}
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: '#1e4976',
                        borderRadius: 1,
                        bgcolor: '#0a1929',
                        p: 2,
                      }}
                    >
                      <PdfViewer
                        file={submissionFile as string}
                        scale={scale}
                        pageNumber={pageNumber}
                        pdfVersion={pdfjs.version}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        onRenderSuccess={handlePageRenderSuccess}
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {!submissionFile && submissionDownloadUrl && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  File preview unavailable.
                </Typography>
                <Button
                  variant="outlined"
                  component="a"
                  href={submissionDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Submission
                </Button>
              </Box>
            )}

            {!submissionFile && !submissionDownloadUrl && !youtubeLink && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No submission found for this step</Typography>
              </Box>
            )}

            {/* Bottom panel - always visible */}
            <Paper sx={{ flexShrink: 0, p: 2 }}>
              <Stack spacing={2}>
                <SubmissionHistory
                  projectId={projectId!}
                  stepNumber={parseInt(stepNumber!)}
                />
                <CommentThread
                  ref={commentThreadRef}
                  projectId={projectId!}
                  stepNumber={parseInt(stepNumber!)}
                  maxHeight="200px"
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={async () => {
                      popupRef.current?.close();
                      // Submit any text in the comment field first
                      if (commentThreadRef.current?.getCommentText()) {
                        await commentThreadRef.current.submitComment();
                      }
                      await handleSaveComment();
                      setNavigateOnClose(true);
                    }}
                    disabled={isSavingComment}
                  >
                    {isSavingComment ? 'Saving...' : 'Return to Student for Revision'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      popupRef.current?.close();
                      handleApprove();
                    }}
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
        onClose={() => {
          closeAlert();
          if (navigateOnClose) {
            setNavigateOnClose(false);
            navigate('/teacher/dashboard');
          }
        }}
      />
    </Box>
  );
}
