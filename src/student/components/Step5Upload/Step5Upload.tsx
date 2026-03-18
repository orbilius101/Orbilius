import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  Paper,
  LinearProgress,
  TextField,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import { useStep5UploadData } from './hooks/useData';
import { useStep5UploadHandlers } from './hooks/useHandlers';
import SharedHeader from '../SharedHeader/SharedHeader';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Step5Upload() {
  const navigate = useNavigate();
  const {
    file,
    setFile,
    youtubeLink,
    setYoutubeLink,
    uploading,
    setUploading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    status,
    setStatus,
    projectId,
  } = useStep5UploadData(navigate);

  const { handleFileChange, handleYoutubeLinkChange, handleSubmit } = useStep5UploadHandlers({
    projectId,
    setFile,
    setUploading,
    setErrorMsg,
    setSuccess,
    setStatus,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const justDroppedRef = useRef(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    justDroppedRef.current = true;
    setTimeout(() => {
      justDroppedRef.current = false;
    }, 300);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    handleFileChange({ target: { files: [dropped], value: '' } } as any);
  };

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
                5
              </Typography>
            </Box>
            <Typography variant="h4" component="h2">
              Project Cycle Phases
              <br />
              Step 5: Closeout the Project!
            </Typography>
          </Box>

          <Typography variant="body1">
            This is it. You're almost done! Please make sure that your file is in PDF format and
            upload the document by clicking the button.
          </Typography>

          {success && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              ✅ Submission successful! Your submission is awaiting teacher review.
            </Alert>
          )}
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          {status === 'Submitted' || status === 'Approved' ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'success.dark', color: 'white' }}>
              <CheckCircleIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Submission Complete
              </Typography>
              <Typography variant="body1">
                Your submission has been uploaded and is{' '}
                {status === 'Approved' ? 'approved' : 'awaiting teacher review'}.
              </Typography>
              {youtubeLink && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>YouTube Link:</strong>{' '}
                  <Link
                    href={youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'white' }}
                  >
                    {youtubeLink}
                  </Link>
                </Typography>
              )}
            </Paper>
          ) : (
            <Stack spacing={2}>
              <Paper
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.light' : file ? 'primary.main' : 'divider',
                  bgcolor: isDragging
                    ? 'action.selected'
                    : file
                      ? 'primary.dark'
                      : 'background.paper',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
                onClick={() => {
                  if (!justDroppedRef.current) document.getElementById('file-input-s5')?.click();
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragEnd={() => {
                  dragCounterRef.current = 0;
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
              >
                <input
                  id="file-input-s5"
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

              <TextField
                type="url"
                label="Insert Project YouTube Video Link"
                value={youtubeLink}
                onChange={(e) => handleYoutubeLinkChange(e, setYoutubeLink)}
                placeholder="https://www.youtube.com/watch?v=..."
                fullWidth
              />
            </Stack>
          )}

          {file && status !== 'Submitted' && status !== 'Approved' && (
            <Button
              variant="contained"
              size="large"
              onClick={() => handleSubmit(file, youtubeLink)}
              disabled={uploading || !file || !youtubeLink.trim() || !projectId}
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{ py: 2, fontSize: '1.1rem', fontWeight: 600 }}
            >
              {uploading ? 'Uploading...' : 'Submit Project Closeout'}
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
