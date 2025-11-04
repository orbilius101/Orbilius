// src/admin/dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, CircularProgress } from '@mui/material';

import { useAuthAdmin } from './hooks/useAuthAdmin';
import { useAdminCode } from './hooks/useAdminCode';
import { usePendingProjects } from './hooks/usePendingProjects';
import { useAlert } from '../hooks/useAlert';

import AdminHeader from './components/AdminHeader';
import AdminCodeManager from './components/AdminCodeManager';
import ProjectsList from './components/Projects/ProjectsList';
import ProjectReviewModal from './components/ReviewModal/ProjectReviewModal';
import AlertDialog from '../components/AlertDialog/AlertDialog';

export default function AdminDashboard() {
  const _navigate = useNavigate();
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
      </Container>
    </Box>
  );
}
