// src/admin/dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { getDocuments, buildConstraints, updateDocument } from '../utils/firebaseHelpers';
import { CLOUD_FUNCTIONS } from '../config/functions';
import EmailIcon from '@mui/icons-material/Email';
import PaletteIcon from '@mui/icons-material/Palette';
import SchoolIcon from '@mui/icons-material/School';

import { useAuthAdmin } from './hooks/useAuthAdmin';
import { usePendingProjects } from './hooks/usePendingProjects';
import { useTeachers } from './hooks/useTeachers';
import { useAlert } from '../hooks/useAlert';
import { useTheme } from '../contexts/ThemeContext';

import AdminHeader from './components/AdminHeader';
import ProjectsList from './components/Projects/ProjectsList';
import TeachersList from './components/Teachers/TeachersList';
import ProjectReviewModal from './components/ReviewModal/ProjectReviewModal';
import AlertDialog from '../components/AlertDialog/AlertDialog';
import ConfirmDialog from './components/ConfirmDialog';
import InviteModal from './components/InviteModal';
import EditUserModal from './components/EditUserModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [resendEmail, setResendEmail] = React.useState<string | undefined>(undefined);
  const [resending, setResending] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    userType: 'teacher' | 'student';
  } | null>(null);
  const { alertState, showAlert, closeAlert } = useAlert();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { loadingAuth } = useAuthAdmin(showAlert);
  const {
    projects,
    selected,
    submission,
    comments,
    setComments,
    updating,
    view,
    clearModal,
    certify,
  } = usePendingProjects(showAlert);
  const {
    teachers,
    loading: loadingTeachers,
    handleDelete,
    handleDeleteStudent,
    confirmDelete,
    refresh: refreshTeachers,
    toastState,
    closeToast,
    confirmState,
    closeConfirm,
  } = useTeachers(showAlert);

  const handleImpersonate = async (teacherId: string) => {
    try {
      // Store current admin user ID in sessionStorage
      const currentUser = auth.currentUser;
      if (currentUser) {
        sessionStorage.setItem('impersonating_admin_uid', currentUser.uid);
        sessionStorage.setItem('impersonating_teacher_uid', teacherId);

        // Navigate to teacher dashboard
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      console.error('Error impersonating teacher:', error);
      showAlert('Failed to impersonate teacher. Please try again.', 'Error');
    }
  };

  const handleResendInvitation = async (email: string) => {
    setResending(true);
    try {
      // Check if invitation already exists
      const { data: existingInvitations } = await getDocuments(
        'pending_invitations',
        buildConstraints({
          eq: { email, role: 'teacher' },
        })
      );

      // Generate a unique invitation code
      const invitationCode = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      if (existingInvitations && existingInvitations.length > 0) {
        // Update existing invitation
        const existingInvite = existingInvitations[0];
        await updateDocument('pending_invitations', existingInvite.id, {
          status: 'pending',
          invited_at: Timestamp.now(),
          invitation_code: invitationCode,
        });
      } else {
        // Create new invitation
        await addDoc(collection(db, 'pending_invitations'), {
          email,
          role: 'teacher',
          status: 'pending',
          invited_at: Timestamp.now(),
          invitation_code: invitationCode,
        });
      }

      // Generate signup URL with invitation code
      const signupUrl = `${window.location.origin}/signup?invite=${invitationCode}`;

      // Send invitation email via Firebase Cloud Function
      const inviteResponse = await fetch(CLOUD_FUNCTIONS.sendInvite, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role: 'teacher',
          signupUrl,
        }),
      });

      const inviteResult = await inviteResponse.json();

      if (!inviteResponse.ok) {
        const errorMessage = inviteResult.details
          ? `${inviteResult.error}: ${inviteResult.details}`
          : inviteResult.error || 'Failed to resend invitation.';
        showAlert(errorMessage, 'Error');
      } else {
        showAlert('Invitation resent successfully!', 'Success');
        refreshTeachers(); // Refresh teachers list
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      showAlert('Error resending invitation. Please try again.', 'Error');
    } finally {
      setResending(false);
    }
  };

  if (loadingAuth) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <AdminHeader />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PaletteIcon />
            <Typography variant="h6">Theme Settings</Typography>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Select Theme</InputLabel>
            <Select
              value={currentTheme}
              label="Select Theme"
              onChange={async (e) => {
                try {
                  await setTheme(e.target.value as any);
                  showAlert('Theme updated successfully for all users!', 'Success');
                } catch (err) {
                  showAlert('Failed to update theme. Please try again.', 'Error');
                }
              }}
            >
              {availableThemes.map((theme) => (
                <MenuItem key={theme.name} value={theme.name}>
                  {theme.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon />
              <Typography variant="h5">
                Teachers ({teachers.length})
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={() => setShowInviteModal(true)}
            >
              Invite Teacher
            </Button>
          </Box>
          {loadingTeachers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TeachersList
              teachers={teachers}
              onDelete={handleDelete}
              onDeleteStudent={handleDeleteStudent}
              onResendInvitation={handleResendInvitation}
              onImpersonate={handleImpersonate}
              onEditTeacher={(teacher) =>
                setEditingUser({
                  id: teacher.id,
                  first_name: teacher.first_name,
                  last_name: teacher.last_name,
                  email: teacher.email,
                  userType: 'teacher',
                })
              }
              onEditStudent={(student) =>
                setEditingUser({
                  id: student.id,
                  first_name: student.first_name,
                  last_name: student.last_name,
                  email: student.email,
                  userType: 'student',
                })
              }
            />
          )}
        </Paper>
        {/* Edit User Modal */}
        <EditUserModal
          open={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={refreshTeachers}
          showAlert={showAlert}
        />
        {/* Invitation Modal */}
        {showInviteModal && (
          <InviteModal
            open={showInviteModal}
            onClose={() => {
              setShowInviteModal(false);
              setResendEmail(undefined); // Clear resend email
              refreshTeachers(); // Refresh teachers list after sending invitation
            }}
            role="teacher"
            showAlert={showAlert}
            initialEmail={resendEmail}
          />
        )}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Project Certification Queue ({projects.length} pending)
          </Typography>
          <ProjectsList projects={projects} onReview={view} />
        </Paper>
        <ProjectReviewModal
          project={selected}
          submission={submission}
          comments={comments}
          setComments={setComments}
          onClose={clearModal}
          onCertify={certify}
          updating={updating}
          showAlert={showAlert}
        />
        <AlertDialog
          open={alertState.open}
          title={alertState.title}
          message={alertState.message}
          onClose={closeAlert}
        />
        <Snackbar
          open={toastState.open}
          autoHideDuration={3000}
          onClose={closeToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={closeToast} severity={toastState.severity} sx={{ width: '100%' }}>
            {toastState.message}
          </Alert>
        </Snackbar>
        <ConfirmDialog
          open={confirmState.open}
          title={`Delete ${confirmState.type === 'teacher' ? 'Teacher' : 'Student'}`}
          message={
            confirmState.status === 'active'
              ? confirmState.type === 'teacher'
                ? `⚠️ WARNING: You are about to permanently delete ${confirmState.name} and ALL associated data.\n\nThis action will delete:\n• Teacher account\n• All students under this teacher\n• All projects from those students\n• All project submissions and files\n• All comments and feedback\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?`
                : `⚠️ WARNING: You are about to permanently delete ${confirmState.name} and ALL associated data.\n\nThis action will delete:\n• Student account\n• All student projects\n• All project submissions and files\n• All comments and feedback\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?`
              : `Are you sure you want to delete the invitation for ${confirmState.name}?`
          }
          onConfirm={confirmDelete}
          onCancel={closeConfirm}
          confirmText="Delete"
          cancelText="Cancel"
          requireTypedConfirmation={confirmState.status === 'active' ? 'delete' : undefined}
        />
      </Container>
    </Box>
  );
}
