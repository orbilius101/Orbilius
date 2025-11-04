// src/admin/components/Projects/ProjectCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

export default function ProjectCard({ project, onReview }) {
  return (
    <Card sx={{ bgcolor: 'grey.50' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {project.project_title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Student: {project.users.first_name} {project.users.last_name} ({project.users.email})
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Created: {new Date(project.created_at).toLocaleDateString()}
        </Typography>
        <Button variant="contained" onClick={() => onReview(project)} fullWidth>
          Review Final Submission
        </Button>
      </CardContent>
    </Card>
  );
}
