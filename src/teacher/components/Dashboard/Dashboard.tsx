import React, { useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import InviteModal from '../../../admin/components/InviteModal';
import ImpersonationBanner from '../../../admin/components/ImpersonationBanner';
import StepSubmissionModal from '../StepSubmissionModal/StepSubmissionModal';
import StudentsList from './StudentsList';
import ConfirmDialog from '../../../admin/components/ConfirmDialog';
import { getDocuments, buildConstraints, deleteDocument, updateDocument } from '../../../utils/firebaseHelpers';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { storage } from '../../../firebaseConfig';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  AppBar,
  Toolbar,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
} from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import { useDashboardData } from './hooks/useData';
import { useDashboardHandlers } from './hooks/useHandlers';
import { useStudents } from './hooks/useStudents';
import AlertDialog from '../../../components/AlertDialog/AlertDialog';
import { auth } from '../../../firebaseConfig';
import orbiliusLogo from '../../../assets/merle-386x386-yellow.svg';
import { Project } from '../../../types';

export default function TeacherDashboard() {
  const data = useDashboardData();
  const handlers = useDashboardHandlers(data);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');
  const [resendConfirmOpen, setResendConfirmOpen] = useState(false);
  const [emailToResend, setEmailToResend] = useState('');
  const [submissionModal, setSubmissionModal] = useState<{
    open: boolean;
    projectId: string | null;
    stepNumber: number | null;
    project: Project | null;
  }>({
    open: false,
    projectId: null,
    stepNumber: null,
    project: null,
  });
  const [allStudentsExpanded, setAllStudentsExpanded] = useState(true);
  const [deleteSubmissionState, setDeleteSubmissionState] = useState<{
    open: boolean;
    project: Project | null;
    stepNumber: number | null;
    deleting: boolean;
  }>({ open: false, project: null, stepNumber: null, deleting: false });

  const {
    user,
    userProfile,
    projects,
    navigate,
    alertState,
    showAlert,
    closeAlert,
    refreshProjects,
  } = data;

  // Check if admin is impersonating a teacher
  const impersonatingTeacherId = sessionStorage.getItem('impersonating_teacher_uid');
  const effectiveTeacherId = impersonatingTeacherId || user?.uid;

  // Initialize students hook
  const studentsHook = useStudents(effectiveTeacherId, showAlert, refreshProjects);
  const students = studentsHook.students;

  // Debug logging
  console.log('Teacher Dashboard - User ID:', user?.uid);
  console.log('Teacher Dashboard - Projects:', projects);
  console.log('Teacher Dashboard - Projects length:', projects?.length);

  // Count projects that need review (have any submitted step)
  const projectsNeedingReview = projects.filter((project) => {
    for (let i = 1; i <= 5; i++) {
      if (project[`step${i}_status`] === 'Submitted') {
        return true;
      }
    }
    return false;
  }).length;

  const {
    getCurrentStepName,
    getCurrentStepDueDate,
    getCurrentStepSubmissionStatus,
    getActionButtonText,
    handleActionClick,
  } = handlers;

  const handleEmailStudent = (studentEmail: string) => {
    const mailtoLink = `mailto:${studentEmail}`;
    window.open(mailtoLink);
  };

  const handleEmailProjectStudent = (project: Project) => {
    const studentEmail = project.student?.email || project.email;
    const studentFirstName = project.student?.first_name || project.first_name;
    const currentStepStatus = project[`step${project.current_step}_status`];
    const currentStepName = getCurrentStepName(project.current_step);

    if (!studentEmail) {
      showAlert('Student email not found. Please check the project data.', 'Error');
      return;
    }

    let subject, body;

    if (currentStepStatus === 'Submitted') {
      subject = `Feedback on ${project.project_title} - Step ${project.current_step}`;
      body = `Hello ${studentFirstName},

I have reviewed your submission for Step ${project.current_step}: ${currentStepName} of your project "${project.project_title}".

Please log into the Orbilius platform to view my feedback and next steps.

If you have any questions, please don't hesitate to reach out.

Best regards,
${userProfile?.first_name || 'Your Teacher'}`;
    } else {
      subject = `Follow-up on ${project.project_title} - Step ${project.current_step}`;
      body = `Hello ${studentFirstName},

I wanted to follow up on your project "${project.project_title}".

You are currently on Step ${project.current_step}: ${currentStepName}.
Current status: ${currentStepStatus}

Please log into the Orbilius platform to continue your work or view any feedback.

If you need any assistance, please let me know.

Best regards,
${userProfile?.first_name || 'Your Teacher'}`;
    }

    const mailtoLink = `mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const handleCopyTeacherId = () => {
    navigator.clipboard.writeText(user?.uid);
    showAlert('Teacher ID copied to clipboard!', 'Success');
  };

  const handleCopySignupLink = () => {
    const signupLink = `${window.location.origin}/signup?teacherId=${user?.uid}`;
    navigator.clipboard.writeText(signupLink);
    showAlert('Signup link copied to clipboard!', 'Success');
  };

  const handleResendInvitation = (email: string) => {
    setEmailToResend(email);
    setResendConfirmOpen(true);
  };

  const handleConfirmResend = () => {
    setResendConfirmOpen(false);
    setInitialEmail(emailToResend);
    setShowInviteModal(true);
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInitialEmail('');
    // Reload students after sending/resending invitation
    studentsHook.loadStudents();
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleStepClick = (project: Project, stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    const stepStatus = project[`step${stepNumber}_status`];

    // Navigate to approval page for submitted steps
    if (stepStatus === 'Submitted') {
      navigate(`/teacher/step-approval/${project.project_id}/${stepNumber}`);
    }
    // Open modal for approved steps
    else if (stepStatus === 'Approved') {
      setSubmissionModal({
        open: true,
        projectId: project.project_id,
        stepNumber: stepNumber,
        project: project,
      });
    }
  };

  const handleCloseSubmissionModal = () => {
    setSubmissionModal({
      open: false,
      projectId: null,
      stepNumber: null,
      project: null,
    });
  };

  const handleOpenDeleteSubmission = (project: Project, stepNumber: number) => {
    setDeleteSubmissionState({ open: true, project, stepNumber, deleting: false });
  };

  const handleDeleteSubmission = async () => {
    const { project, stepNumber } = deleteSubmissionState;
    if (!project || !stepNumber) return;

    setDeleteSubmissionState((s) => ({ ...s, deleting: true }));

    try {
      // Find the submission document
      const { data: submissions } = await getDocuments(
        'submissions',
        buildConstraints({ eq: { project_id: project.project_id, step_number: stepNumber } })
      );

      if (submissions && (submissions as any[]).length > 0) {
        const submission = (submissions as any[])[0];

        // Delete file from Firebase Storage if present
        if (submission.file_url) {
          try {
            const urlObj = new URL(submission.file_url);
            const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
            if (pathMatch?.[1]) {
              const filePath = decodeURIComponent(pathMatch[1]);
              await deleteObject(storageRef(storage, filePath));
            }
          } catch (storageErr) {
            console.warn('Could not delete storage file:', storageErr);
          }
        }

        // Delete the submission document
        await deleteDocument('submissions', submission.id);
      }

      // Reset step status on the project
      const updates: Record<string, any> = {
        [`step${stepNumber}_status`]: 'Not Started',
      };
      // If this step is at or ahead of current_step, roll back current_step
      if (stepNumber <= project.current_step) {
        updates.current_step = stepNumber;
        updates.current_step_status = 'Not Started';
      }
      await updateDocument('projects', project.project_id, updates);

      // Refresh
      await data.refreshProjects(effectiveTeacherId);
      setDeleteSubmissionState({ open: false, project: null, stepNumber: null, deleting: false });
      showAlert(`Step ${stepNumber} submission deleted and reset to Not Started.`, 'Deleted');
    } catch (err: any) {
      console.error('Delete submission failed:', err);
      showAlert(err.message || 'Failed to delete submission.', 'Error');
      setDeleteSubmissionState((s) => ({ ...s, deleting: false }));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ImpersonationBanner />
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h1">
              Teacher Dashboard
            </Typography>
            {projectsNeedingReview > 0 && (
              <Tooltip title={`${projectsNeedingReview} project${projectsNeedingReview === 1 ? '' : 's'} need${projectsNeedingReview === 1 ? 's' : ''} review`} arrow>
                <Badge
                  badgeContent={projectsNeedingReview}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 },
                    animation: 'bellRing 2s ease-in-out infinite',
                    '@keyframes bellRing': {
                      '0%':   { transform: 'rotate(0deg)' },
                      '5%':   { transform: 'rotate(15deg)' },
                      '10%':  { transform: 'rotate(-13deg)' },
                      '15%':  { transform: 'rotate(11deg)' },
                      '20%':  { transform: 'rotate(-9deg)' },
                      '25%':  { transform: 'rotate(7deg)' },
                      '30%':  { transform: 'rotate(-5deg)' },
                      '35%':  { transform: 'rotate(3deg)' },
                      '40%':  { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(0deg)' },
                    },
                  }}
                >
                  <NotificationsIcon sx={{ color: '#ffd700', fontSize: 28 }} />
                </Badge>
              </Tooltip>
            )}
          </Box>

          {/* Students Section with Projects */}
          {students.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Welcome to Orbilius!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You don't have any students yet. Invite students to join your class and start their
                science fair journey.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EmailIcon />}
                onClick={() => setShowInviteModal(true)}
                size="large"
              >
                Invite Your First Student
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5">Students & Projects</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={allStudentsExpanded ? 'Collapse All' : 'Expand All'}>
                    <IconButton
                      onClick={() => setAllStudentsExpanded(!allStudentsExpanded)}
                      size="small"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                      }}
                    >
                      {allStudentsExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EmailIcon />}
                    onClick={() => setShowInviteModal(true)}
                  >
                    Invite Student
                  </Button>
                </Box>
              </Box>
              <StudentsList
                students={studentsHook.students}
                projects={projects}
                onDelete={studentsHook.openConfirm}
                onResendInvitation={handleResendInvitation}
                onEmailStudent={handleEmailStudent}
                onEmailProjectStudent={handleEmailProjectStudent}
                onStepClick={handleStepClick}
                onViewSubmission={(project, stepNumber) => handleStepClick(project, stepNumber - 1)}
                onDeleteSubmission={handleOpenDeleteSubmission}
                getCurrentStepName={getCurrentStepName}
                getCurrentStepSubmissionStatus={getCurrentStepSubmissionStatus}
                navigate={navigate}
                allExpanded={allStudentsExpanded}
              />
            </Paper>
          )}

          {/* Invitation Modal */}
          {showInviteModal && (
            <InviteModal
              open={showInviteModal}
              onClose={handleCloseInviteModal}
              role="student"
              teacherId={effectiveTeacherId}
              showAlert={showAlert}
              initialEmail={initialEmail}
            />
          )}

          {/* Resend Confirmation Dialog */}
          <Dialog open={resendConfirmOpen} onClose={() => setResendConfirmOpen(false)}>
            <DialogTitle>Resend Invitation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to resend the invitation to {emailToResend}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResendConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmResend} variant="contained" color="primary">
                Resend
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={studentsHook.confirmState.open}
            title={`Delete ${studentsHook.confirmState.type}`}
            message={
              studentsHook.confirmState.status === 'active'
                ? `⚠️ WARNING: You are about to permanently delete ${studentsHook.confirmState.name} and ALL associated data.\n\nThis action will delete:\n• Student account\n• All student projects\n• All project submissions and files\n• All comments and feedback\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?`
                : `Are you sure you want to delete the invitation for ${studentsHook.confirmState.name}?`
            }
            onConfirm={studentsHook.confirmDelete}
            onCancel={studentsHook.closeConfirm}
            confirmText="Delete"
            cancelText="Cancel"
            requireTypedConfirmation={
              studentsHook.confirmState.status === 'active' ? 'delete' : undefined
            }
          />

          {/* Delete Submission Confirmation Dialog */}
          <ConfirmDialog
            open={deleteSubmissionState.open}
            title="Delete Submission"
            message={`This will permanently delete the Step ${deleteSubmissionState.stepNumber} submission for "${deleteSubmissionState.project?.project_title}" and reset the step to Not Started. The student will need to re-submit.\n\nThis action cannot be undone.`}
            onConfirm={handleDeleteSubmission}
            onCancel={() => setDeleteSubmissionState({ open: false, project: null, stepNumber: null, deleting: false })}
            confirmText={deleteSubmissionState.deleting ? 'Deleting...' : 'Delete'}
            cancelText="Cancel"
            requireTypedConfirmation="delete"
          />
        </Stack>
      </Container>
      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
      {submissionModal.open && submissionModal.projectId && submissionModal.stepNumber && (
        <StepSubmissionModal
          open={submissionModal.open}
          onClose={handleCloseSubmissionModal}
          projectId={submissionModal.projectId}
          stepNumber={submissionModal.stepNumber}
          project={submissionModal.project}
        />
      )}
    </Box>
  );
}
