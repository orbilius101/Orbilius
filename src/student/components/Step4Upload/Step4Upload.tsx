import { Box, Container, Typography, Button, TextField, Stack, Alert, Paper } from '@mui/material';
import SharedHeader from '../SharedHeader/SharedHeader';
import { useNavigate } from 'react-router-dom';
import { useStep4UploadData } from './hooks/useData';
import { useStep4UploadHandlers } from './hooks/useHandlers';

export default function Step4Upload() {
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
  } = useStep4UploadData(navigate);

  const { handleFileChange, handleUpload } = useStep4UploadHandlers({
    projectId,
    setFile,
    setUploading,
    setErrorMsg,
    setSuccess,
    setStatus,
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

          <Typography variant="h4" component="h2">
            Project Cycle Phases
            <br />
            Step 4: Implementation!!!
          </Typography>

          <Typography variant="body1">
            You finished your project? That's amazing!!! Please make sure that your file is in PDF
            format and upload the document by clicking the button. After your teacher approves this
            step, you will be able to access Step 5.
          </Typography>

          {status !== 'Submitted' && status !== 'Approved' ? (
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Select PDF File:
                  </Typography>
                  <input type="file" accept="application/pdf" onChange={handleFileChange} />
                </Box>

                <Button
                  variant="contained"
                  onClick={() => handleUpload(file)}
                  disabled={uploading || !file}
                  fullWidth
                >
                  {uploading ? 'Uploading...' : 'Upload Your Annotated Bibliography Here'}
                </Button>
              </Stack>
            </Paper>
          ) : (
            <Alert severity="success">
              ✅ Your submission has been uploaded and is{' '}
              {status === 'Approved' ? 'approved' : 'awaiting teacher review'}.
            </Alert>
          )}

          {success && <Alert severity="success">Upload successful!</Alert>}
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Step 4: Implementation Status</Typography>
              <TextField value={status} disabled fullWidth />

              <Typography variant="h6">Teacher Comments:</Typography>
              <TextField value={teacherComments} disabled multiline rows={4} fullWidth />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
