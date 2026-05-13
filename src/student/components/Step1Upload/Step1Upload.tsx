import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  Paper,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { useStep1UploadData } from './hooks/useData';
import { useStep1UploadHandlers } from './hooks/useHandlers';
import SharedHeader from '../SharedHeader/SharedHeader';
import CommentThread from '../../../components/CommentThread/CommentThread';
import SubmissionHistory from '../../../components/SubmissionHistory/SubmissionHistory';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Step1Upload() {
  const {
    navigate,
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
    loading,
    isDragging,
    setIsDragging,
    dragCounterRef,
    justDroppedRef,
  } = useStep1UploadData();

  const {
    handleFileChange,
    handleUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleDropZoneClick,
  } = useStep1UploadHandlers({
    projectId,
    setFile,
    setUploading,
    setErrorMsg,
    setSuccess,
    setStatus,
    setIsDragging,
    dragCounterRef,
    justDroppedRef,
  });


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <SharedHeader />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Button
            variant="outlined"
            onClick={() => navigate('/student/dashboard')}
            sx={{ alignSelf: 'flex-start' }}
          >
            ← Back to Dashboard
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: '#ffd700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  color: 'background.default',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  lineHeight: 1,
                }}
              >
                1
              </Typography>
            </Box>
            <Typography variant="h4" component="h2">
              Project Cycle Phases
              <br />
              Step 1: Initial Research Upload
            </Typography>
          </Box>

          <Typography variant="body1">
            Congrats on completing your initial research! Please make sure that your file is in PDF
            format and upload the document by clicking the button. After your teacher approves this
            step, you will be able to access Step 2.
          </Typography>

          {success && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              ✅ Upload successful! Your submission is awaiting teacher review.
            </Alert>
          )}
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          {status === 'Revision Requested' && (
            <Alert severity="warning" sx={{ fontWeight: 500 }}>
              Your teacher has requested a revision for this step. Please review their comments below and resubmit.
            </Alert>
          )}

          {status === 'Submitted' || status === 'Approved' ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'success.dark',
                color: 'white',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Submission Complete
              </Typography>
              <Typography variant="body1">
                Your submission has been uploaded and is{' '}
                {status === 'Approved' ? 'approved' : 'awaiting teacher review'}.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                You may close this window or return to your dashboard.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/student/dashboard')}
                sx={{ mt: 2, color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
              >
                Return to Dashboard
              </Button>
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.light' : file ? 'primary.main' : 'divider',
                bgcolor: isDragging
                  ? 'action.selected'
                  : file
                    ? 'primary.main'
                    : 'background.paper',
                transition: 'all 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.light',
                  bgcolor: file ? 'primary.dark' : 'action.hover',
                },
              }}
              onClick={handleDropZoneClick}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon
                  sx={{ fontSize: 60, color: file ? 'white' : 'text.secondary' }}
                />
                <Typography variant="h6" sx={{ color: file ? 'white' : 'text.primary', fontWeight: file ? 600 : undefined }}>
                  {file ? file.name : 'Click to select PDF file'}
                </Typography>
                <Typography variant="body2" sx={{ color: file ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                  {file ? 'Click again to change file' : 'or drag and drop your PDF here'}
                </Typography>
              </Stack>
            </Paper>
          )}

          {!loading && !projectId && (
            <Alert severity="warning">
              Project data not loaded. Please refresh the page or contact support.
            </Alert>
          )}

          {file && status !== 'Submitted' && status !== 'Approved' && (
            <Tooltip
              title={
                loading
                  ? 'Loading project data…'
                  : uploading
                    ? 'Uploading in progress…'
                    : !projectId
                      ? 'Project data not loaded. Please refresh the page.'
                      : ''
              }
              arrow
            >
              <span style={{ display: 'block' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleUpload(file)}
                  disabled={uploading || loading || !projectId}
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&.Mui-disabled': { bgcolor: 'primary.main', color: 'rgba(255,255,255,0.5)', opacity: 0.7 },
                  }}
                >
                  {loading
                    ? 'Loading...'
                    : uploading
                      ? 'Submitting...'
                      : 'Submit to Teacher'}
                </Button>
              </span>
            </Tooltip>
          )}

          {uploading && (
            <Box>
              <LinearProgress />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center' }}
              >
                Uploading your file...
              </Typography>
            </Box>
          )}

          {projectId && (
            <Paper sx={{ p: 2 }}>
              <SubmissionHistory projectId={projectId} stepNumber={1} />
            </Paper>
          )}

          {projectId && (
            <Paper sx={{ p: 2 }}>
              <CommentThread projectId={projectId} stepNumber={1} />
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
