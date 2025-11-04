import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { RocketLaunch, Help, Upload } from '@mui/icons-material';
import SharedHeader from '../SharedHeader/SharedHeader';
import { useNavigate } from 'react-router-dom';
import { useStep4IndexData } from './hooks/useData';
import { useStep4IndexHandlers } from './hooks/useHandlers';

export default function Step4Index() {
  const navigate = useNavigate();
  const { getAnnotatedBibliographyUrl } = useStep4IndexData();
  const { handleDownloadAnnotatedBibliography } = useStep4IndexHandlers({
    getAnnotatedBibliographyUrl,
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
            It's time to get to work! As you move into this phase of the project, you are inevitably
            going to hit deeper into the research of your project. So we're going to ask you to
            maintain an annotated bibliography to capture your learning. See the help button below
            for detail.
          </Typography>

          <Typography variant="body1">
            During this step, you'll also want to make sure you are documenting the work you're
            doing. Be sure to take good photos and video of the work in progress. These documents
            will be so important for the final video that you are going to create in the last step
            of the project.
          </Typography>

          <Typography variant="body1">
            Create a folder and store your documentation. Trust us, you won't regret it.
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
              <Button variant="contained" onClick={handleDownloadAnnotatedBibliography} fullWidth>
                Download Step 4: Implementation - Annotated Bibliography
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
              <Button variant="contained" fullWidth>
                How Do I Create An Annotated Bibliography?
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Upload /> Ready to Submit Step 4?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/student/step4/stepFourUpload')}
                fullWidth
              >
                Upload Your Annotated Bibliography Here.
              </Button>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
