import React, { useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import InviteModal from '../../../admin/components/InviteModal';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  LinearProgress,
  Tooltip,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Logout as LogoutIcon,
  HourglassEmpty as InProgressIcon,
  Send as SubmittedIcon,
  CheckCircle as ApprovedIcon,
  RadioButtonUnchecked as NotStartedIcon,
} from '@mui/icons-material';
import { useDashboardData } from './hooks/useData';
import { useDashboardHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';
import { supabase } from '../../../supabaseClient';
import orbiliusLogo from '../../../assets/merle-386x386-yellow.svg';

export default function TeacherDashboard() {
  const data = useDashboardData();
  const handlers = useDashboardHandlers(data);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { user, userProfile, projects, navigate, alertState, showAlert, closeAlert } = data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <NotStartedIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />;
      case 'In Progress':
        return <InProgressIcon fontSize="small" sx={{ color: 'warning.main', mr: 0.5 }} />;
      case 'Submitted':
        return <SubmittedIcon fontSize="small" sx={{ color: 'info.main', mr: 0.5 }} />;
      case 'Approved':
        return <ApprovedIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />;
      default:
        return null;
    }
  };

  const getProgressBarSegments = (project: any) => {
    const segments = [];
    const stepNames = [
      'Initial Research',
      'Proposal',
      'Data Collection',
      'Analysis',
      'Final Report',
    ];
    for (let i = 1; i <= 5; i++) {
      const stepStatus = project[`step${i}_status`];
      segments.push({
        isApproved: stepStatus === 'Approved',
        isInProgress: i === project.current_step && stepStatus !== 'Approved',
        stepName: stepNames[i - 1],
        status: stepStatus || 'Not Started',
      });
    }
    return segments;
  };

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

  const handleCopySignupLink = () => {
    const signupLink = `${window.location.origin}/signup?teacherId=${user?.id}`;
    navigator.clipboard.writeText(signupLink);
    showAlert('Signup link copied to clipboard!', 'Success');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <img src={orbiliusLogo} alt="Orbilius" style={{ height: '40px' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              Orbilius
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {userProfile && (
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {userProfile.first_name} {userProfile.last_name}
              </Typography>
            )}
            <Chip label="Teacher" color="secondary" sx={{ fontWeight: 600 }} />
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
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
                        <Box>
                          <Typography variant="body2">
                            {project.current_step}/5 - {getCurrentStepName(project.current_step)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                            {getProgressBarSegments(project).map((segment, index) => (
                              <Tooltip
                                key={index}
                                title={`${segment.stepName}: ${segment.status}`}
                                arrow
                              >
                                <Box
                                  sx={{
                                    flex: 1,
                                    height: 6,
                                    bgcolor: segment.isApproved
                                      ? 'success.main'
                                      : segment.isInProgress
                                        ? 'warning.main'
                                        : 'grey.300',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getCurrentStepDueDate(project)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(getCurrentStepSubmissionStatus(project))}
                          {getCurrentStepSubmissionStatus(project)}
                        </Box>
                      </TableCell>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Student Signup Information</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EmailIcon />}
                  onClick={() => setShowInviteModal(true)}
                >
                  Send Invitation
                </Button>
              </Box>
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
                    bgcolor: '#061b42',
                    color: '#F1F5F9',
                    border: '1px solid #1a3a6b',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Signup Link:
                </Typography>
                <Typography
                  component="code"
                  sx={{
                    bgcolor: '#061b42',
                    color: '#F1F5F9',
                    border: '1px solid #1a3a6b',
                    p: 1,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {window.location.origin}/signup?teacherId={user?.id}
                </Typography>
                <IconButton onClick={handleCopySignupLink} color="primary">
                  <CopyIcon />
                </IconButton>
              </Box>
            </Stack>
            {/* Invitation Modal placeholder */}
            {showInviteModal && (
              <InviteModal
                open={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                role="student"
                teacherId={user?.id}
                showAlert={showAlert}
              />
            )}
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
