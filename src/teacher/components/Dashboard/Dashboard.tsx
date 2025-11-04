import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import { ContentCopy as CopyIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useDashboardData } from './hooks/useData';
import { useDashboardHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';
import { supabase } from '../../../supabaseClient';
import orbiliusLogo from '../../../assets/merle-386x386.svg';

export default function TeacherDashboard() {
  const data = useDashboardData();
  const handlers = useDashboardHandlers(data);

  const { user, userProfile, projects, navigate, alertState, showAlert, closeAlert } = data;

  // Debug logging
  console.log('Teacher Dashboard - User ID:', user?.id);
  console.log('Teacher Dashboard - Projects:', projects);
  console.log('Teacher Dashboard - Projects length:', projects?.length);

  const {
    getCurrentStepName,
    getCurrentStepDueDate,
    getCurrentStepSubmissionStatus,
    getActionButtonText,
    handleActionClick,
  } = handlers;

  const handleCopyTeacherId = () => {
    navigator.clipboard.writeText(user?.id);
    showAlert('Teacher ID copied to clipboard!', 'Success');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={orbiliusLogo} alt="Orbilius" style={{ height: '40px' }} />
            <Typography variant="h6" component="div">
              Orbilius
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {userProfile && (
              <>
                <Typography variant="body1">
                  {userProfile.first_name} {userProfile.last_name}
                </Typography>
                <Chip label="Teacher" color="secondary" size="small" sx={{ px: 0.5 }} />
              </>
            )}
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Typography variant="h4" component="h1">
            Teacher Dashboard
          </Typography>

          {projects.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Student Name</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Grade</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Project Title</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Current Cycle Step</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Timeline</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Step Status</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Action</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.project_id} hover>
                      <TableCell>
                        {project.student?.last_name || project.last_name},{' '}
                        {project.student?.first_name || project.first_name}
                      </TableCell>
                      <TableCell>{project.grade}</TableCell>
                      <TableCell>
                        {project[`step${project.current_step}_status`] === 'Submitted' ? (
                          <Button
                            onClick={() =>
                              navigate(
                                `/teacher/step-approval/${project.project_id}/${project.current_step}`
                              )
                            }
                            sx={{ textTransform: 'none' }}
                          >
                            {project.project_title}
                          </Button>
                        ) : (
                          project.project_title
                        )}
                      </TableCell>
                      <TableCell>
                        {project.current_step}/5 - {getCurrentStepName(project.current_step)}
                      </TableCell>
                      <TableCell>{getCurrentStepDueDate(project)}</TableCell>
                      <TableCell>{getCurrentStepSubmissionStatus(project)}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleActionClick(project)}
                        >
                          {getActionButtonText(project)}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No projects assigned yet.</Typography>
          )}

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Student Signup Information</Typography>
              <Typography variant="body1">
                Students need your Teacher ID to sign up. Share this ID with your students:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Your Teacher ID:
                </Typography>
                <Typography
                  component="code"
                  sx={{
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    flex: 1,
                  }}
                >
                  {user?.id}
                </Typography>
                <IconButton onClick={handleCopyTeacherId} color="primary">
                  <CopyIcon />
                </IconButton>
              </Box>
            </Stack>
          </Paper>
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
