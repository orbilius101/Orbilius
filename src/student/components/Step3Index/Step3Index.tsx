import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { RocketLaunch, Help, Upload } from '@mui/icons-material';
import SharedHeader from '../SharedHeader/SharedHeader';
import { useNavigate } from 'react-router-dom';
import { useStep3IndexData } from './hooks/useData';
import { useStep3IndexHandlers } from './hooks/useHandlers';

export default function Step3Index() {
  const navigate = useNavigate();
  const { getPlanningDocsUrl } = useStep3IndexData();
  const { handleDownloadPlanningDocs } = useStep3IndexHandlers({ getPlanningDocsUrl });

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
            Step 3: Planning Documents
          </Typography>

          <Typography variant="body1">
            You have your project idea, now it's time to plan! There are two steps in planning:
            Breaking down the work, and setting a timeline. This is always tough to do first-time
            around, but careful work here will help you hit your goals in a timely manner. Again,
            this will not be perfect. Give us the best work and thinking you can.
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
              <Button variant="contained" onClick={handleDownloadPlanningDocs} fullWidth>
                Download Step 3: Planning Docs
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
              <Stack spacing={1}>
                <Button variant="contained" fullWidth>
                  How Do I Break Work Down?
                </Button>
                <Button variant="contained" fullWidth>
                  How Do I Create a Gantt Chart?
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Upload /> Ready to Submit Step 3?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/student/step3/stepThreeUpload')}
                fullWidth
              >
                Upload Your Planning Docs Here.
              </Button>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
