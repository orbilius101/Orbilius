import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  Paper,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStep1UploadData } from './hooks/useData';
import { useStep1UploadHandlers } from './hooks/useHandlers';
import SharedHeader from '../SharedHeader/SharedHeader';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Step1Upload() {
  const navigate = useNavigate();
  const {
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
  } = useStep1UploadData(navigate);

  const { handleFileChange, handleUpload } = useStep1UploadHandlers({
    projectId,
    setFile,
    setUploading,
    setErrorMsg,
    setSuccess,
    setStatus,
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    // Reuse handleFileChange by synthesizing a compatible event
    handleFileChange({ target: { files: [dropped], value: '' } } as any);
  };

  console.log('Step1Upload render - projectId:', projectId, 'loading:', loading, 'file:', file);

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

          <Typography variant="h4" component="h2">
            Project Cycle Phases
            <br />
            Step 1: Initial Research Upload
          </Typography>

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
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.light' : file ? 'primary.main' : 'divider',
                bgcolor: isDragging ? 'action.selected' : file ? 'primary.dark' : 'background.paper',
                transition: 'all 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => document.getElementById('file-input')?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                  sx={{ fontSize: 60, color: file ? 'primary.main' : 'text.secondary' }}
                />
                <Typography variant="h6" color={file ? 'primary.main' : 'text.primary'}>
                  {file ? file.name : 'Click to select PDF file'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
              }}
            >
              {loading
                ? 'Loading...'
                : uploading
                  ? 'Uploading...'
                  : 'Upload Initial Research Bibliography'}
            </Button>
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
        </Stack>
      </Container>
    </Box>
  );
}
