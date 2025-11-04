import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { RocketLaunch, Help, Upload } from '@mui/icons-material';
import SharedHeader from '../SharedHeader/SharedHeader';
import { useNavigate } from 'react-router-dom';
import { useStep2IndexData } from './hooks/useData';
import { useStep2IndexHandlers } from './hooks/useHandlers';

export default function Step2Index() {
  const navigate = useNavigate();
  const { getDesignBriefUrl, getDesignBriefInstructionsUrl } = useStep2IndexData();
  const { handleDownloadDesignBrief, handleDownloadInstructions } = useStep2IndexHandlers({
    getDesignBriefUrl,
    getDesignBriefInstructionsUrl,
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
            Step 2: Design Brief
          </Typography>

          <Typography variant="body1">
            You've done your initial research and are now ready to commit to a project! This is
            where the Design Brief comes in! A design brief allows you to sketch out a shared
            understanding of the project. <strong>Don't worry about getting this perfect.</strong>{' '}
            Give us what you've got. It's natural for projects to change course as the work evolves.
            If that happens, talk to your teacher and simply readjust the design brief and your
            planning documents!
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
              <Button variant="contained" onClick={handleDownloadDesignBrief} fullWidth>
                Download Step 2: Design Brief
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
              <Button variant="contained" onClick={handleDownloadInstructions} fullWidth>
                How Do I Create A Design Brief?
              </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Upload /> Ready to Submit Step 2?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/student/step2/stepTwoUpload')}
                fullWidth
              >
                Upload Your Project Design Brief Here.
              </Button>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
