import { Box, Container, Typography, Button, TextField, Paper, Stack, Alert } from '@mui/material';
import { useSubmitStepData } from './hooks/useData';
import { useSubmitStepHandlers } from './hooks/useHandlers';

export default function SubmitStep({ projectId }: { projectId?: string }) {
  const {
    file,
    setFile,
    stepNumber,
    setStepNumber,
    notes,
    setNotes,
    uploading,
    setUploading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
  } = useSubmitStepData();

  const { handleFileChange, handleUpload } = useSubmitStepHandlers({
    setFile,
    setUploading,
    setErrorMsg,
    setSuccess,
    setNotes,
    setStepNumber,
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <form onSubmit={(e) => handleUpload(e, file, stepNumber, notes, projectId)}>
            <Stack spacing={3}>
              <Typography variant="h4" component="h2">
                Upload Submission
              </Typography>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  PDF File:
                </Typography>
                <input type="file" accept="application/pdf" onChange={handleFileChange} required />
              </Box>

              <TextField
                type="number"
                label="Step Number (1–5)"
                value={stepNumber}
                onChange={(e) => setStepNumber(e.target.value)}
                inputProps={{ min: 1, max: 5 }}
                required
                fullWidth
              />

              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <Button type="submit" variant="contained" disabled={uploading} fullWidth>
                {uploading ? 'Uploading...' : 'Submit'}
              </Button>

              {success && <Alert severity="success">Submission uploaded successfully!</Alert>}
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
