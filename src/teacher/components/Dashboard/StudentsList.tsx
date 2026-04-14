import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Chip,
  Paper,
  Collapse,
  Button,
  Badge,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  HourglassEmpty as InProgressIcon,
  Send as SubmittedIcon,
  CheckCircle as ApprovedIcon,
  RadioButtonUnchecked as NotStartedIcon,
  Visibility as ViewIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
} from '@mui/icons-material';
import { Project } from '../../../types';
import CommentThread from '../../../components/CommentThread/CommentThread';
import { getDocuments, buildConstraints } from '../../../utils/firebaseHelpers';

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status: 'active' | 'pending';
  invited_at?: string;
  grade?: string;
}

interface StudentsListProps {
  students: Student[];
  projects: Project[];
  onDelete: (studentId: string, studentName: string) => void;
  onResendInvitation?: (email: string) => void;
  onEmailStudent: (studentEmail: string) => void;
  onEmailProjectStudent: (project: Project) => void;
  onStepClick: (project: Project, stepIndex: number) => void;
  onViewSubmission: (project: Project, stepNumber: number) => void;
  onDeleteSubmission: (project: Project, stepNumber: number) => void;
  getCurrentStepName: (stepNumber: number) => string;
  getCurrentStepSubmissionStatus: (project: Project) => string;
  navigate: (path: string) => void;
  allExpanded: boolean;
}

export default function StudentsList({
  students,
  projects,
  onDelete,
  onResendInvitation,
  onEmailStudent,
  onEmailProjectStudent,
  onStepClick,
  onViewSubmission,
  onDeleteSubmission,
  getCurrentStepName,
  getCurrentStepSubmissionStatus,
  navigate,
  allExpanded,
}: StudentsListProps) {
  // Initialize all students as expanded
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(() => {
    return new Set(students.map((s) => s.id));
  });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [lastCommentDates, setLastCommentDates] = useState<Record<string, string>>({});

  // Fetch comment counts and last comment date per project
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      const dates: Record<string, string> = {};
      for (const project of projects) {
        try {
          const { data } = await getDocuments(
            'step_comments',
            buildConstraints({ eq: { project_id: project.project_id } })
          );
          const comments = (data as any[]) || [];
          counts[project.project_id] = comments.length;
          if (comments.length > 0) {
            const latest = comments.reduce((a, b) => {
              const aTime = a.created_at?.seconds || 0;
              const bTime = b.created_at?.seconds || 0;
              return aTime > bTime ? a : b;
            });
            const ts = latest.created_at;
            const date = ts?.toDate ? ts.toDate() : new Date(ts?.seconds ? ts.seconds * 1000 : ts);
            dates[project.project_id] = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });
          }
        } catch {
          counts[project.project_id] = 0;
        }
      }
      setCommentCounts(counts);
      setLastCommentDates(dates);
    };
    if (projects.length > 0) fetchCounts();
  }, [projects]);

  // Update expanded state when allExpanded changes
  useEffect(() => {
    if (allExpanded) {
      setExpandedStudents(new Set(students.map((s) => s.id)));
    } else {
      setExpandedStudents(new Set());
    }
  }, [allExpanded, students]);

  const toggleStudent = (studentId: string) => {
    setExpandedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Returns steps that have Submitted or Approved status
  const getActiveSteps = (project: Project) => {
    const stepNames = [
      'Initial Research',
      'Design Brief',
      'Planning',
      'Implementation',
      'Archival Records',
    ];
    return [1, 2, 3, 4, 5]
      .map((n) => ({ stepNumber: n, name: stepNames[n - 1], status: project[`step${n}_status`] }))
      .filter((s) => s.status === 'Submitted' || s.status === 'Approved');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <NotStartedIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />;
      case 'In Progress':
        return <InProgressIcon fontSize="small" sx={{ color: 'warning.main', mr: 0.5 }} />;
      case 'Submitted':
        return <SubmittedIcon fontSize="small" sx={{ color: 'info.main', mr: 0.5 }} />;
      case 'Approved':
        return <ApprovedIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />;
      default:
        return null;
    }
  };

  const getProgressBarSegments = (project: Project) => {
    const segments = [];
    const stepNames = [
      'Initial Research',
      'Proposal',
      'Data Collection',
      'Analysis',
      'Final Report',
    ];
    for (let i = 1; i <= 5; i++) {
      const stepStatus = project[`step${i}_status`];
      const rawDue = project[`step${i}_due_date`];
      const dueDate = rawDue
        ? new Date(rawDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;
      segments.push({
        isApproved: stepStatus === 'Approved',
        isInProgress: i === project.current_step && stepStatus !== 'Approved',
        isSubmitted: stepStatus === 'Submitted',
        stepName: stepNames[i - 1],
        status: stepStatus || 'Not Started',
        stepNumber: i,
        dueDate,
      });
    }
    return segments;
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get projects for a specific student
  const getStudentProjects = (studentId: string) => {
    return projects.filter((p) => p.student_id === studentId);
  };

  if (students.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No students found.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="40px"></TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date Joined</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => {
            const displayName =
              student.status === 'pending'
                ? student.email
                : `${student.first_name} ${student.last_name}`;
            const studentProjects = getStudentProjects(student.id);
            const isExpanded = expandedStudents.has(student.id);

            return (
              <React.Fragment key={student.id}>
                <TableRow hover>
                  <TableCell>
                    {studentProjects.length > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => toggleStudent(student.id)}
                        sx={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>{displayName}</TableCell>
                  <TableCell>
                    {student.status === 'active' ? (
                      <Typography
                        variant="body2"
                        component="span"
                        onClick={() => onEmailStudent(student.email)}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {student.email}
                      </Typography>
                    ) : (
                      student.email
                    )}
                  </TableCell>
                  <TableCell>
                    {student.grade ? (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'primary.main', fontWeight: 600, lineHeight: 1 }}
                        >
                          {student.grade}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        student.status === 'pending'
                          ? `Invitation Sent${student.invited_at ? ` ${formatDate(student.invited_at)}` : ''}`
                          : 'Active'
                      }
                      color={student.status === 'pending' ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {student.status === 'pending'
                      ? '—'
                      : formatDate(student.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {student.status === 'pending' && onResendInvitation && (
                        <Tooltip title="Resend invitation">
                          <IconButton
                            size="small"
                            onClick={() => onResendInvitation(student.email)}
                            color="primary"
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip
                        title={
                          student.status === 'pending' ? 'Delete invitation' : 'Delete student'
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => onDelete(student.id, displayName)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Collapsible Projects Section */}
                {studentProjects.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}
                    >
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            m: 2,
                            p: 2,
                            bgcolor: '#0F2E5F',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}
                          >
                            Projects ({studentProjects.length})
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell width="32px" />
                                <TableCell sx={{ fontWeight: 600 }}>Project Title</TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '40%' }}>
                                  Progress
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '50px' }} />
                                <TableCell sx={{ fontWeight: 600, width: '130px' }}>
                                  Status
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, width: '80px' }}>
                                  Action
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {studentProjects.map((project) => {
                                const activeSteps = getActiveSteps(project);
                                const isProjectExpanded = expandedProjects.has(project.project_id);
                                return (
                                  <React.Fragment key={project.project_id}>
                                    <TableRow>
                                      <TableCell sx={{ py: 0.5 }}>
                                        <Tooltip
                                          title={
                                            isProjectExpanded
                                              ? 'Hide details'
                                              : 'View details'
                                          }
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() => toggleProject(project.project_id)}
                                            sx={{
                                              transform: isProjectExpanded
                                                ? 'rotate(180deg)'
                                                : 'rotate(0deg)',
                                              transition: 'transform 0.3s',
                                            }}
                                          >
                                            <ExpandMoreIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {project[`step${project.current_step}_status`] ===
                                          'Submitted' ? (
                                            <Typography
                                              component="span"
                                              onClick={() =>
                                                navigate(
                                                  `/teacher/step-approval/${project.project_id}/${project.current_step}`
                                                )
                                              }
                                              sx={{
                                                color: 'primary.main',
                                                fontWeight: 500,
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                  color: 'primary.dark',
                                                },
                                              }}
                                            >
                                              {project.project_title}
                                            </Typography>
                                          ) : (
                                            project.project_title
                                          )}
                                          {project[`step${project.current_step}_status`] ===
                                            'Submitted' && (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              onClick={() =>
                                                navigate(
                                                  `/teacher/step-approval/${project.project_id}/${project.current_step}`
                                                )
                                              }
                                              sx={{
                                                color: '#ffd700',
                                                borderColor: '#ffd700',
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                py: 0.25,
                                                px: 1,
                                                minWidth: 0,
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                '&:hover': {
                                                  borderColor: '#ffd700',
                                                  bgcolor: 'rgba(255,215,0,0.1)',
                                                },
                                              }}
                                            >
                                              Click to Review
                                            </Button>
                                          )}
                                        </Box>
                                      </TableCell>
                                      <TableCell sx={{ width: '40%' }}>
                                        <Box
                                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                                        >
                                          <Box sx={{ flex: 1 }}>
                                            <Typography
                                              variant="body2"
                                              sx={{ mb: 0.5, fontWeight: 500 }}
                                            >
                                              Step {project.current_step}/5:{' '}
                                              {getCurrentStepName(project.current_step)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                              {getProgressBarSegments(project).map(
                                                (segment, index) => (
                                                  <Tooltip
                                                    key={index}
                                                    title={`${segment.stepName}: ${segment.status}${segment.isApproved ? ' (Click to view)' : ''}${segment.isSubmitted ? ' (Click to review)' : ''}`}
                                                    arrow
                                                  >
                                                    <Box
                                                      sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 0.75,
                                                      }}
                                                    >
                                                      <Box
                                                        onClick={() => onStepClick(project, index)}
                                                        sx={{
                                                          width: '100%',
                                                          height: 8,
                                                          bgcolor: segment.isApproved
                                                            ? 'success.main'
                                                            : segment.isInProgress
                                                              ? 'warning.main'
                                                              : 'grey.300',
                                                          background: segment.isSubmitted
                                                            ? 'repeating-linear-gradient(45deg, #ffd700, #ffd700 4px, #4caf50 4px, #4caf50 8px)'
                                                            : undefined,
                                                          borderRadius: 1,
                                                          cursor:
                                                            segment.isApproved ||
                                                            segment.isSubmitted
                                                              ? 'pointer'
                                                              : 'default',
                                                          transition: 'all 0.2s',
                                                          '&:hover': segment.isApproved
                                                            ? {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: 2,
                                                                bgcolor: 'success.dark',
                                                              }
                                                            : segment.isSubmitted
                                                              ? {
                                                                  transform: 'translateY(-2px)',
                                                                  boxShadow:
                                                                    '0 0 12px 4px rgba(255, 215, 0, 0.6)',
                                                                }
                                                              : {},
                                                        }}
                                                      />
                                                      {segment.dueDate && (
                                                        <Typography
                                                          variant="caption"
                                                          sx={{
                                                            fontSize: '0.6rem',
                                                            color: 'text.secondary',
                                                            lineHeight: 1,
                                                            textAlign: 'center',
                                                            whiteSpace: 'nowrap',
                                                          }}
                                                        >
                                                          {segment.dueDate}
                                                        </Typography>
                                                      )}
                                                    </Box>
                                                  </Tooltip>
                                                )
                                              )}
                                            </Box>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell sx={{ width: '50px' }} align="center">
                                        {(commentCounts[project.project_id] || 0) > 0 && (
                                          <Tooltip title={`${commentCounts[project.project_id]} comment${commentCounts[project.project_id] === 1 ? '' : 's'}${lastCommentDates[project.project_id] ? ` · Last: ${lastCommentDates[project.project_id]}` : ''}`}>
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                setExpandedProjects((prev) => {
                                                  const newSet = new Set(prev);
                                                  newSet.add(project.project_id);
                                                  return newSet;
                                                });
                                              }}
                                            >
                                              <Badge
                                                badgeContent={commentCounts[project.project_id]}
                                                color="primary"
                                                max={99}
                                              >
                                                <ChatBubbleOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                              </Badge>
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      </TableCell>
                                      <TableCell sx={{ width: '130px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          {getStatusIcon(getCurrentStepSubmissionStatus(project))}
                                          <Typography variant="body2">
                                            {getCurrentStepSubmissionStatus(project)}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell sx={{ width: '80px' }}>
                                        <Tooltip title="Email student about this project">
                                          <IconButton
                                            size="small"
                                            onClick={() => onEmailProjectStudent(project)}
                                            color="primary"
                                          >
                                            <EmailIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>

                                    {/* Collapsible submissions & comments */}
                                    <TableRow>
                                      <TableCell
                                        colSpan={7}
                                        sx={{
                                          py: 0,
                                          borderBottom: isProjectExpanded ? undefined : 'none',
                                        }}
                                      >
                                        <Collapse
                                          in={isProjectExpanded}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          {activeSteps.length > 0 && (
                                            <Box
                                              sx={{
                                                mx: 2,
                                                my: 1,
                                                p: 1.5,
                                                bgcolor: '#071e3d',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                              }}
                                            >
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: 'text.secondary',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: 0.5,
                                                }}
                                              >
                                                Submitted / Approved Steps
                                              </Typography>
                                              <Table size="small" sx={{ mt: 1 }}>
                                                <TableHead>
                                                  <TableRow>
                                                    <TableCell
                                                      sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        fontSize: '0.75rem',
                                                      }}
                                                    >
                                                      Step
                                                    </TableCell>
                                                    <TableCell
                                                      sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        fontSize: '0.75rem',
                                                      }}
                                                    >
                                                      Name
                                                    </TableCell>
                                                    <TableCell
                                                      sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        fontSize: '0.75rem',
                                                      }}
                                                    >
                                                      Status
                                                    </TableCell>
                                                    <TableCell
                                                      align="right"
                                                      sx={{
                                                        fontWeight: 600,
                                                        color: 'text.secondary',
                                                        fontSize: '0.75rem',
                                                      }}
                                                    >
                                                      Actions
                                                    </TableCell>
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {activeSteps.map((step) => (
                                                    <TableRow key={step.stepNumber}>
                                                      <TableCell sx={{ fontSize: '0.8rem' }}>
                                                        {step.stepNumber}
                                                      </TableCell>
                                                      <TableCell sx={{ fontSize: '0.8rem' }}>
                                                        {step.name}
                                                      </TableCell>
                                                      <TableCell>
                                                        <Chip
                                                          label={step.status}
                                                          size="small"
                                                          color={
                                                            step.status === 'Approved'
                                                              ? 'success'
                                                              : 'warning'
                                                          }
                                                          variant="outlined"
                                                          icon={
                                                            step.status === 'Approved' ? (
                                                              <ApprovedIcon />
                                                            ) : (
                                                              <SubmittedIcon />
                                                            )
                                                          }
                                                        />
                                                      </TableCell>
                                                      <TableCell align="right">
                                                        <Box
                                                          sx={{
                                                            display: 'flex',
                                                            gap: 0.5,
                                                            justifyContent: 'flex-end',
                                                          }}
                                                        >
                                                          <Tooltip title="View submission">
                                                            <Button
                                                              size="small"
                                                              variant="outlined"
                                                              startIcon={<ViewIcon />}
                                                              onClick={() =>
                                                                onViewSubmission(
                                                                  project,
                                                                  step.stepNumber
                                                                )
                                                              }
                                                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                                                            >
                                                              View
                                                            </Button>
                                                          </Tooltip>
                                                          <Tooltip title="Delete submission and reset step">
                                                            <Button
                                                              size="small"
                                                              variant="outlined"
                                                              color="error"
                                                              startIcon={<DeleteIcon />}
                                                              onClick={() =>
                                                                onDeleteSubmission(
                                                                  project,
                                                                  step.stepNumber
                                                                )
                                                              }
                                                              sx={{ fontSize: '0.75rem', py: 0.25 }}
                                                            >
                                                              Delete
                                                            </Button>
                                                          </Tooltip>
                                                        </Box>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            </Box>
                                          )}
                                          {/* Project comment thread */}
                                          <Box
                                            sx={{
                                              mx: 2,
                                              my: 1,
                                              p: 1.5,
                                              bgcolor: '#071e3d',
                                              borderRadius: 1,
                                              border: '1px solid',
                                              borderColor: 'divider',
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                              <ChatBubbleOutlineIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: 'text.secondary',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: 0.5,
                                                }}
                                              >
                                                Comments
                                              </Typography>
                                            </Box>
                                            <CommentThread
                                              projectId={project.project_id}
                                              maxHeight="250px"
                                            />
                                          </Box>
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
