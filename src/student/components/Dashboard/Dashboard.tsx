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
  TextField,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  HourglassEmpty as HourglassIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as NotStartedIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useDashboardData } from './hooks/useData';
import { useDashboardHandlers } from './hooks/useHandlers';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';
import SharedModal from '../SharedModal/SharedModal';
import { supabase } from '../../../supabaseClient';
import orbiliusLogo from '../../../assets/merle-386x386-yellow.svg';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function StudentDashboard() {
  const [modalState, setModalState] = useState<{
    open: boolean;
    title: string;
    content: React.ReactNode;
  }>({ open: false, title: '', content: null });

  const data = useDashboardData();
  const handlers = useDashboardHandlers(data);

  const {
    user,
    userProfile,
    project,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    editingDueDate,
    setEditedDueDate,
    navigate,
    alertState,
    closeAlert,
  } = data;

  const {
    handleTitleEdit,
    handleTitleSave,
    handleTitleCancel,
    handleDueDateEdit,
    handleDueDateSave,
  } = handlers;

  const renderRow = (stepNum: number, title: string) => {
    const status = project?.[`step${stepNum}_status`] || 'Not Started';
    const _due = project?.[`step${stepNum}_due_date`]
      ? new Date(project[`step${stepNum}_due_date`]).toLocaleDateString()
      : 'N/A';

    const getStatusIcon = () => {
      switch (status) {
        case 'Not Started':
          return <NotStartedIcon fontSize="small" sx={{ color: 'text.disabled' }} />;
        case 'In Progress':
          return <HourglassIcon fontSize="small" sx={{ color: 'warning.main' }} />;
        case 'Submitted':
          return <SendIcon fontSize="small" sx={{ color: 'info.main' }} />;
        case 'Approved':
          return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />;
        default:
          return null;
      }
    };

    const isAccessible = () => {
      if (stepNum === 1) return true;
      const previousStepStatus = project?.[`step${stepNum - 1}_status`];
      return previousStepStatus === 'Approved';
    };

    const getStepLink = () => {
      if (!isAccessible()) return null;
      const stepNames = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
      const stepName = stepNames[stepNum];

      if (status === 'In Progress' || status === 'Not Started') {
        return `/student/step${stepNum}/step${stepName}Index`;
      } else if (status === 'Submitted' || status === 'Approved') {
        return `/student/step${stepNum}/step${stepName}Upload`;
      }
      return null;
    };

    const stepLink = getStepLink();
    const accessible = isAccessible();
    const isApproved = status === 'Approved';
    const _isEditingThisDate = editingDueDate === stepNum;

    const handleStepClick = () => {
      if (accessible && stepLink) {
        navigate(stepLink);
      }
    };

    return (
      <TableRow key={stepNum} hover={accessible && !!stepLink}>
        <TableCell
          onClick={handleStepClick}
          sx={{
            cursor: accessible && stepLink ? 'pointer' : 'default',
            color: accessible ? (stepLink ? '#FFC107' : 'text.primary') : 'text.disabled',
            textDecoration: accessible && stepLink ? 'underline' : 'none',
            '&:hover': {
              color: accessible && stepLink ? '#FFD54F' : undefined,
            },
          }}
        >
          Step {stepNum}: {title}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon()}
            {status}
          </Box>
        </TableCell>
        <TableCell>
          <TextField
            type="date"
            value={
              project?.[`step${stepNum}_due_date`]
                ? new Date(project[`step${stepNum}_due_date`]).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => {
              if (!isApproved && e.target.value) {
                handleDueDateEdit(stepNum);
                handleDueDateSave(stepNum, e.target.value);
              }
            }}
            size="small"
            disabled={isApproved}
            sx={{
              minWidth: 150,
              '& .MuiSvgIcon-root': {
                color: '#FFFFFF',
              },
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              style: { cursor: isApproved ? 'not-allowed' : 'pointer' },
            }}
          />
        </TableCell>
        <TableCell>
          {project?.[`step${stepNum}_due_date`] && status !== 'Approved' ? (
            <Typography
              variant="body2"
              sx={{
                color: dayjs(project[`step${stepNum}_due_date`]).isBefore(dayjs())
                  ? 'error.main'
                  : 'text.primary',
              }}
            >
              {dayjs(project[`step${stepNum}_due_date`]).toNow(true)}
            </Typography>
          ) : status === 'Approved' ? (
            <Typography variant="body2" color="text.disabled">
              Completed
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              N/A
            </Typography>
          )}
        </TableCell>
      </TableRow>
    );
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
              <Typography variant="body1">
                {userProfile.first_name} {userProfile.last_name}
              </Typography>
            )}
            {userProfile && <Chip label="Student" color="primary" size="small" sx={{ px: 0.5 }} />}
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {user && userProfile ? (
          <Stack spacing={4}>
            <Typography variant="h4" component="h2">
              {userProfile.first_name} {userProfile.last_name}'s Project
            </Typography>

            {project && (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {!isEditingTitle ? (
                    <>
                      <Typography variant="h5" sx={{ flex: 1 }}>
                        {project.project_title || 'Untitled Project'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={handleTitleEdit}
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                      <TextField
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Enter project title"
                        fullWidth
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleTitleSave();
                          } else if (e.key === 'Escape') {
                            handleTitleCancel();
                          }
                        }}
                      />
                      <Button variant="contained" onClick={handleTitleSave}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={handleTitleCancel}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}

            {project ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Project Cycle Phases
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Status
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Date
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Time Remaining
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderRow(1, 'Initial Research')}
                    {renderRow(2, 'Design Brief')}
                    {renderRow(3, 'Planning')}
                    {renderRow(4, 'Implementation')}
                    {renderRow(5, 'Closeout - Archival Records')}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No project found.</Typography>
            )}

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ width: '100%' }}
            >
              <Button
                variant="outlined"
                sx={{ width: { xs: '100%', md: 'auto' } }}
                onClick={() => {
                  setModalState({
                    open: true,
                    title: 'Bi-weekly Reflections',
                    content: <Typography>Bi-weekly reflections content coming soon...</Typography>,
                  });
                }}
              >
                Bi-weekly Reflections
              </Button>
              <Button
                variant="outlined"
                sx={{ width: { xs: '100%', md: 'auto' } }}
                onClick={() => {
                  setModalState({
                    open: true,
                    title: 'One-on-one Meeting Log',
                    content: <Typography>Meeting log content coming soon...</Typography>,
                  });
                }}
              >
                One-on-one Meeting Log
              </Button>
              <Button
                variant="outlined"
                sx={{ width: { xs: '100%', md: 'auto' } }}
                onClick={() => {
                  setModalState({
                    open: true,
                    title: 'Help Docs & Videos',
                    content: <Typography>Help documentation coming soon...</Typography>,
                  });
                }}
              >
                Help Docs & Videos
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Container>
      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
      <SharedModal
        open={modalState.open}
        onClose={() => setModalState({ open: false, title: '', content: null })}
        title={modalState.title}
      >
        {modalState.content}
      </SharedModal>
    </Box>
  );
}
