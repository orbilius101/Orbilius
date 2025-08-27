// src/admin/dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles as s } from './styles/adminStyles';

import { useAuthAdmin } from './hooks/useAuthAdmin';
import { useAdminCode } from './hooks/useAdminCode';
import { usePendingProjects } from './hooks/usePendingProjects';

import AdminHeader from './components/AdminHeader';
import AdminCodeManager from './components/AdminCodeManager';
import ProjectsList from './components/Projects/ProjectsList';
import ProjectReviewModal from './components/ReviewModal/ProjectReviewModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loadingAuth } = useAuthAdmin();
  const { adminCode, newAdminCode, setNewAdminCode, isEditing, setIsEditing, save } =
    useAdminCode();
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
  } = usePendingProjects();

  if (loadingAuth) return <div style={s.loading}>Loading...</div>;

  return (
    <div style={s.container}>
      <AdminHeader onSignOut={() => navigate('/login')} />

      <AdminCodeManager
        adminCode={adminCode}
        newAdminCode={newAdminCode}
        setNewAdminCode={setNewAdminCode}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={save}
      />

      <div style={{ ...s.card, marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>
          Project Certification Queue ({projects.length} pending)
        </h2>
        <ProjectsList projects={projects} onReview={view} />
      </div>

      <ProjectReviewModal
        project={selected}
        submission={submission}
        comments={comments}
        setComments={setComments}
        onClose={clearModal}
        onCertify={certify}
        updating={updating}
      />
    </div>
  );
}
