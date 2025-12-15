// src/admin/components/ReviewModal/ProjectReviewModal.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  Stack,
  Paper,
  Link,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { downloadProjectFile } from '../../api/adminApi';

export default function ProjectReviewModal({
  project,
  submission,
  comments,
  setComments,
  onClose,
  onCertify,
  updating,
  showAlert,
}) {
  if (!project) return null;

  const dl = async () => {
    if (!submission?.file_path) return;
    const { data, error } = await downloadProjectFile(submission.file_path);
    if (error) {
      showAlert('Error downloading file: ' + error.message, 'Error');
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = submission.file_path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Reviewing: {project.project_title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2">
              <strong>Student:</strong> {project.users.first_name} {project.users.last_name}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {project.users.email}
            </Typography>
            <Typography variant="body2">
              <strong>Project Created:</strong> {new Date(project.created_at).toLocaleDateString()}
            </Typography>
          </Paper>

          {submission && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 5 Final Submission
              </Typography>

              {submission.file_path && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Submitted File:</strong>
                  </Typography>
                  <Button variant="contained" color="success" onClick={dl}>
                    Download Submission
                  </Button>
                </Box>
              )}

              {submission.youtube_link && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>YouTube Video:</strong>
                  </Typography>
                  <Link
                    href={submission.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {submission.youtube_link}
                  </Link>
                </Box>
              )}

              {submission.teacher_comments && (
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Teacher Comments:</strong>
                  </Typography>
                  <Typography variant="body2" fontStyle="italic">
                    {submission.teacher_comments}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          <TextField
            label="Orbilius Comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add comments for the student and teacher..."
            multiline
            rows={4}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={() => onCertify(false)}
          disabled={updating}
          variant="contained"
          color="error"
        >
          {updating ? 'Processing...' : 'Send Back for Revision'}
        </Button>
        <Button
          onClick={() => onCertify(true)}
          disabled={updating}
          variant="contained"
          color="success"
        >
          {updating ? 'Processing...' : 'Certify Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
