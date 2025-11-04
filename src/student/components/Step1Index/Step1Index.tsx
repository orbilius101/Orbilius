import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { RocketLaunch, Help, Upload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStep1IndexData } from './hooks/useData';
import { useStep1IndexHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';
import SharedHeader from '../SharedHeader/SharedHeader';

export default function Step1Index() {
  const navigate = useNavigate();
  const { getDiscoveryLogUrl, getInstructionsUrl, alertState, showAlert, closeAlert } =
    useStep1IndexData();
  const { handleDownloadBibliography, handleDownloadHelpGuide } = useStep1IndexHandlers({
    getDiscoveryLogUrl,
    getInstructionsUrl,
    showAlert,
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
            Step 1: Initial Research
          </Typography>

          <Typography variant="body1">
            Before committing to your project, we ask you to do 2–4 weeks of initial research into
            your area of interest. Remain open to the possibility that you might discover something
            even cooler to work on or might be able to add an interesting angle to the project that
            you haven't considered before.
          </Typography>

          <Typography variant="body1">
            Keep a running list of the best sources that you are finding and enter them in your
            Initial Research bibliography below.
          </Typography>

          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <RocketLaunch /> Get Started!!!
              </Typography>
              <Button variant="contained" onClick={handleDownloadBibliography} fullWidth>
                Download Step 1: The Discovery Log
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Help /> Help!!!
              </Typography>
              <Button variant="contained" onClick={handleDownloadHelpGuide} fullWidth>
                Discovery Log Instructions
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Upload /> Ready to Submit Step 1?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/student/step1/stepOneUpload')}
                fullWidth
              >
                Upload Your Discovery Log Here.
              </Button>
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
