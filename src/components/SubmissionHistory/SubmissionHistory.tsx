import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { getDocuments, buildConstraints } from '../../utils/firebaseHelpers';
import type { Submission } from '../../types';

interface SubmissionHistoryProps {
  projectId: string;
  stepNumber: number;
}

export default function SubmissionHistory({ projectId, stepNumber }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const { data } = await getDocuments(
          'submissions',
          buildConstraints({
            eq: { project_id: projectId, step_number: stepNumber },
          })
        );
        const sorted = ((data as Submission[]) || []).sort(
          (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
        setSubmissions(sorted);
      } catch (err) {
        console.error('Error fetching submission history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [projectId, stepNumber]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (submissions.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: 1,
          py: 0.5,
          '&:hover': { opacity: 0.8 },
        }}
      >
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Submission History
        </Typography>
        <Chip
          label={submissions.length}
          size="small"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Box>

      <Collapse in={expanded}>
        <List dense disablePadding sx={{ pl: 1 }}>
          {submissions.map((sub, index) => (
            <ListItem
              key={sub.submission_id || index}
              sx={{
                py: 0.5,
                borderLeft: '2px solid',
                borderColor: index === 0 ? 'primary.main' : 'divider',
                ml: 1,
                pl: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PictureAsPdfIcon fontSize="small" color={index === 0 ? 'primary' : 'disabled'} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {formatDate(sub.submitted_at)}
                    </Typography>
                    {index === 0 && (
                      <Chip
                        label="Current"
                        size="small"
                        color="primary"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                }
              />
              {sub.file_url && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {index > 0 && (
                    <Button
                      size="small"
                      component="a"
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: '0.7rem', py: 0, px: 0.5, minWidth: 0, textTransform: 'none' }}
                    >
                      View
                    </Button>
                  )}
                  <IconButton
                    component="a"
                    size="small"
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ p: 0.25 }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}
