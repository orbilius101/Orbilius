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
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

import { useAuthAdmin } from './hooks/useAuthAdmin';
import { useAdminCode } from './hooks/useAdminCode';
import { usePendingProjects } from './hooks/usePendingProjects';
import { useTeachers } from './hooks/useTeachers';
import { useAlert } from '../hooks/useAlert';

import AdminHeader from './components/AdminHeader';
import AdminCodeManager from './components/AdminCodeManager';
import ProjectsList from './components/Projects/ProjectsList';
import TeachersList from './components/Teachers/TeachersList';
import ProjectReviewModal from './components/ReviewModal/ProjectReviewModal';
import AlertDialog from '../components/AlertDialog/AlertDialog';
import ConfirmDialog from './components/ConfirmDialog';
import InviteModal from './components/InviteModal';

export default function AdminDashboard() {
  const _navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const { alertState, showAlert, closeAlert } = useAlert();
  const { loadingAuth } = useAuthAdmin(showAlert);
  const { adminCode, newAdminCode, setNewAdminCode, isEditing, setIsEditing, save } =
    useAdminCode(showAlert);
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
    confirmDelete,
    toastState,
    closeToast,
    confirmState,
    closeConfirm,
  } = useTeachers(showAlert);

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
        <AdminCodeManager
          adminCode={adminCode}
          newAdminCode={newAdminCode}
          setNewAdminCode={setNewAdminCode}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={save}
        />
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h5" gutterBottom>
              Teachers ({teachers.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={() => setShowInviteModal(true)}
            >
              Send Invitation
            </Button>
          </Box>
          {loadingTeachers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TeachersList teachers={teachers} onDelete={handleDelete} />
          )}
        </Paper>
        {/* Invitation Modal */}
        {showInviteModal && (
          <InviteModal
            open={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            role="teacher"
            adminCode={adminCode}
            showAlert={showAlert}
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
          title="Delete Teacher"
          message={`Are you sure you want to delete ${confirmState.teacherName}? This will also delete all their students and projects.`}
          onConfirm={confirmDelete}
          onCancel={closeConfirm}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </Container>
    </Box>
  );
}
