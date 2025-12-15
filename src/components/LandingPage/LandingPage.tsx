import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import { useLandingPageData } from './hooks/useData';
import { useLandingPageHandlers } from './hooks/useHandlers';
import AlertDialog from '../AlertDialog/AlertDialog';

export default function LandingPage() {
  const data = useLandingPageData();
  useLandingPageHandlers(data);

  const { showAbout, setShowAbout, navigate, orbiliusLogo, alertState, closeAlert } = data;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navigation Header - Fixed at top */}
      <Box sx={{ py: 4, px: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={() => setShowAbout(!showAbout)}
            variant={showAbout ? 'contained' : 'outlined'}
          >
            About
          </Button>
          <Button onClick={() => navigate('/signup')} variant="outlined">
            Sign Up
          </Button>
          <Button onClick={() => navigate('/login')} variant="contained">
            Login
          </Button>
        </Stack>
      </Box>

      {/* Main Content - Centered */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="center"
          justifyContent="center"
          sx={{ width: '100%' }}
        >
          {/* Left Section - Title or About Content */}
          <Box sx={{ flex: 1, width: '100%' }}>
            {!showAbout ? (
              // Title Section
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '3rem', md: '4rem', lg: '5rem' },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mb: 2,
                  }}
                >
                  Orbilius
                  <br />
                  Project
                  <br />
                  Management
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  (Orbilius PM)
                </Typography>
              </Box>
            ) : (
              // About Section
              <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                  About the Orbilius Project Management (Orbilius PM) Pilot
                </Typography>

                <Stack spacing={2}>
                  <Typography variant="body1">
                    The Orbilius PM Pilot is a limited-run program exploring new ways to support
                    deep, student-driven learning. Partnering with a small group of educators, we're
                    testing a streamlined platform that supports meaningful, independent student
                    work under teacher guidance.
                  </Typography>

                  <Typography variant="body1">
                    This early phase is focused on simplicity, trust, and clarity—providing students
                    with space to pursue purposeful learning while giving educators tools to guide
                    and support them. Our hope is to keep the focus centered on fluid communication
                    between the teacher and student from inception to project completion. Feedback
                    from this pilot will directly shape how we grow the platform, improve its
                    design, and ensure that it remains rooted in what matters most: the learning
                    process itself.
                  </Typography>

                  <Typography variant="body1">
                    If you're part of this pilot, you're helping us imagine what authentic
                    recognition of student work could look like—without adding unnecessary friction
                    to your role as an educator. If you work with students on individualized
                    projects—whether in your own classroom or as a part of a program at your
                    school—and would like to join the pilot, please email us at hello@orbilius.org
                    to talk.
                  </Typography>

                  <Typography variant="body1">
                    From the very bottom of our hearts, thank you for everything you do for those
                    students.
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">Sincerely,</Typography>
                    <Typography variant="body1">The Orbilius Team</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Box>

          {/* Right Section - Orbilius Logo */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={orbiliusLogo}
              alt="Orbilius Logo"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
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
