import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { RocketLaunch, Help, Upload } from '@mui/icons-material';
import SharedHeader from '../SharedHeader/SharedHeader';
import { useNavigate } from 'react-router-dom';

export default function Step5Index() {
  const navigate = useNavigate();

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
            You've finished your project, but you're not done yet! There is one last, most important
            step to complete to closeout your project effective. It's called an Archival Record and
            it is, without question, your moment to shine. You've just spent how many weeks or
            months working on this project? Take a few days to pull together this final
            documentation in order to share this fantastic work with the world.
          </Typography>

          <Typography variant="body1">
            You'll be creating a 3-5 minute video, capturing the project and reflecting up your
            work. Spend time to make this a well-produced video that you'd be proud to share with
            others. We're going to ask you to upload this video to YouTube and share the link with
            us.
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
              <Button variant="contained" fullWidth>
                Download Step 5: Closeout - Archival Records Document
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
                What is an Archival Record?
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Upload /> Ready to Submit Step 5?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/student/step5/stepFiveUpload')}
                fullWidth
              >
                Upload Your Closeout - Archival Record Document Here.
              </Button>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
