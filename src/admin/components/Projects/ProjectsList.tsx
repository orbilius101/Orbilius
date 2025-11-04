// src/admin/components/Projects/ProjectsList.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import ProjectCard from './ProjectCard';

export default function ProjectsList({ projects, onReview }) {
  if (!projects?.length) {
    return (
      <Typography variant="body1" align="center" color="text.secondary" sx={{ p: 3 }}>
        No projects pending certification
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {projects.map((p) => (
        <ProjectCard key={p.project_id} project={p} onReview={onReview} />
      ))}
    </Box>
  );
}
