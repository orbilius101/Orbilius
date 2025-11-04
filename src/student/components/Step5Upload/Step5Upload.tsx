import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  Paper,
  Link,
} from '@mui/material';
import SharedHeader from '../SharedHeader/SharedHeader';
import { useNavigate } from 'react-router-dom';
import { useStep5UploadData } from './hooks/useData';
import { useStep5UploadHandlers } from './hooks/useHandlers';

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
    teacherComments,
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
            Step 5: Closeout the Project!
          </Typography>

          <Typography variant="body1">
            This is it. You're almost done! Please make sure that your file is in PDF format and
            upload the document by clicking the button. After your teacher approves this step, you
            will be able to access Step 5.
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

                <TextField
                  type="url"
                  label="Insert Project YouTube Video Link"
                  value={youtubeLink}
                  onChange={(e) => handleYoutubeLinkChange(e, setYoutubeLink)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={() => handleSubmit(file, youtubeLink)}
                  disabled={uploading || !file || !youtubeLink.trim()}
                  fullWidth
                >
                  {uploading ? 'Uploading...' : 'Submit!!!'}
                </Button>
              </Stack>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Alert severity="success">
                  ✅ Your submission has been uploaded and is{' '}
                  {status === 'Approved' ? 'approved' : 'awaiting teacher review'}.
                </Alert>
                {youtubeLink && (
                  <Box>
                    <Typography variant="body2">
                      <strong>YouTube Link:</strong>{' '}
                      <Link href={youtubeLink} target="_blank" rel="noopener noreferrer">
                        {youtubeLink}
                      </Link>
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {success && <Alert severity="success">Submission successful!</Alert>}
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Step 5: Closeout Status</Typography>
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
