import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack,
  Link,
  IconButton,
  CircularProgress,
  ButtonGroup,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as FitIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { supabase } from '../../../supabaseClient';
import { Project } from '../../../types';

// Use CDN that matches installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface StepSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  stepNumber: number;
  project: Project | null;
}

export default function StepSubmissionModal({
  open,
  onClose,
  projectId,
  stepNumber,
  project,
}: StepSubmissionModalProps) {
  const [loading, setLoading] = useState(true);
  const [submissionFile, setSubmissionFile] = useState<string | null>(null);
  const [youtubeLink, setYoutubeLink] = useState<string | null>(null);
  const [teacherComments, setTeacherComments] = useState<string>('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [showYouTubeModal, setShowYouTubeModal] = useState<boolean>(false);

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

  const stepNames = {
    1: 'Initial Research',
    2: 'Design Brief',
    3: 'Planning',
    4: 'Implementation',
    5: 'Archival Records',
  };

  useEffect(() => {
    if (!open || !projectId || !stepNumber) {
      // Reset state when modal closes
      setYoutubeLink(null);
      setSubmissionFile(null);
      setTeacherComments('');
      setSubmittedAt(null);
      return;
    }

    const fetchSubmissionData = async () => {
      setLoading(true);
      // Reset state before fetching
      setYoutubeLink(null);
      setSubmissionFile(null);

      try {
        // Fetch submission data
        const { data: fileData, error: fileError } = await supabase
          .from('submissions')
          .select('file_url, teacher_comments, submitted_at, youtube_link')
          .eq('project_id', projectId)
          .eq('step_number', stepNumber)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (fileError) {
          console.error('Error fetching submission:', fileError.message);
        } else if (fileData && fileData.length > 0) {
          const latestSubmission = fileData[0];

          // Set YouTube link
          if (latestSubmission.youtube_link) {
            console.log('Setting YouTube link:', latestSubmission.youtube_link);
            setYoutubeLink(latestSubmission.youtube_link);
          } else {
            console.log('No YouTube link found');
          }

          // Handle file URL
          if (latestSubmission.file_url) {
            try {
              // Extract the storage path from the public URL
              // file_url format: userId/projects/projectId/stepN/timestamp.ext
              let filePath = latestSubmission.file_url;

              // If it's a full URL, extract just the path after the bucket name
              if (filePath.includes('/storage/v1/object/public/student-submissions/')) {
                filePath = filePath.split('/storage/v1/object/public/student-submissions/')[1];
              } else if (filePath.includes('supabase.co')) {
                // If it's any other Supabase URL format, extract the path
                const urlParts = filePath.split('student-submissions/');
                if (urlParts.length > 1) {
                  filePath = urlParts[1];
                }
              }

              console.log('Attempting to create signed URL for path:', filePath);

              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('student-submissions')
                .createSignedUrl(filePath, 3600);

              if (signedUrlError) {
                console.error('Error creating signed URL:', signedUrlError.message);
                console.error('File path attempted:', filePath);
                setSubmissionFile(latestSubmission.file_url);
              } else if (signedUrlData) {
                console.log('Successfully created signed URL');
                setSubmissionFile(signedUrlData.signedUrl);
              }
            } catch (error) {
              console.error('Error processing file URL:', error);
              setSubmissionFile(latestSubmission.file_url);
            }
          }

          // Set teacher comments and submitted date
          setTeacherComments(latestSubmission.teacher_comments || 'No comments provided');
          setSubmittedAt(latestSubmission.submitted_at);
        }
      } catch (error) {
        console.error('Error loading submission:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [open, projectId, stepNumber]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const studentName = project?.student
    ? `${project.student.first_name} ${project.student.last_name}`
    : `${project?.first_name || ''} ${project?.last_name || ''}`.trim() || 'Unknown Student';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Step {stepNumber}: {stepNames[stepNumber as keyof typeof stepNames]}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {/* Project and Student Info */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <Typography variant="body2" color="text.primary">
                  <strong>Student:</strong> {studentName}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Project:</strong> {project?.project_title || 'Untitled Project'}
                </Typography>
                {submittedAt && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Submitted:</strong> {new Date(submittedAt).toLocaleDateString()} at{' '}
                    {new Date(submittedAt).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>

              {/* PDF Viewer */}
              {submissionFile && (
                <Box>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            pointerEvents: 'auto',
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
                      </Box>
                      <Box sx={{ flex: 1 }} />
                      {youtubeLink && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setShowYouTubeModal(true)}
                          startIcon={<PlayArrowIcon />}
                          size="small"
                          sx={{ position: 'relative', zIndex: 1 }}
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
                        maxHeight: '68vh',
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
                        onLoadError={(error) => console.error('Error loading PDF:', error)}
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

              {/* Teacher Comments */}
              {teacherComments && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Teacher Feedback
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {teacherComments}
                  </Typography>
                </Box>
              )}

              {!submissionFile && !youtubeLink && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">No submission found for this step.</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* YouTube Video Modal */}
      <Dialog
        open={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
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
            <IconButton onClick={() => setShowYouTubeModal(false)}>
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
          <Button onClick={() => setShowYouTubeModal(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
