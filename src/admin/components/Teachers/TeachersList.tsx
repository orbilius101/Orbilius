import React, { useState } from 'react';
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
  Collapse,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  students?: Student[];
}

interface TeachersListProps {
  teachers: Teacher[];
  onDelete: (teacherId: string, teacherName: string) => void;
}

export default function TeachersList({ teachers, onDelete }: TeachersListProps) {
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

  const toggleExpand = (teacherId: string) => {
    setExpandedTeacherId(expandedTeacherId === teacherId ? null : teacherId);
  };

  if (teachers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No teachers found.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="50px"></TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="center">Students</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teachers.map((teacher) => {
            const studentCount = teacher.students?.length || 0;
            const isExpanded = expandedTeacherId === teacher.id;

            return (
              <React.Fragment key={teacher.id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(teacher.id)}
                      disabled={studentCount === 0}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {teacher.first_name} {teacher.last_name}
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{new Date(teacher.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={studentCount}
                      color={studentCount > 0 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Teacher">
                      <IconButton
                        color="error"
                        onClick={() =>
                          onDelete(teacher.id, `${teacher.first_name} ${teacher.last_name}`)
                        }
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                {studentCount > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}
                    >
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            pl: 8,
                            pr: 2,
                            py: 2,
                            bgcolor: 'background.paper',
                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
                          >
                            Students ({studentCount})
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
                                  Name
                                </TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
                                  Email
                                </TableCell>
                                <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
                                  Joined
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {teacher.students?.map((student) => (
                                <TableRow
                                  key={student.id}
                                  sx={{
                                    '&:hover': {
                                      bgcolor: (theme) =>
                                        theme.palette.mode === 'dark' ? '#334155' : 'action.hover',
                                    },
                                  }}
                                >
                                  <TableCell sx={{ color: 'text.primary' }}>
                                    {student.first_name} {student.last_name}
                                  </TableCell>
                                  <TableCell sx={{ color: 'text.primary' }}>
                                    {student.email}
                                  </TableCell>
                                  <TableCell sx={{ color: 'text.primary' }}>
                                    {new Date(student.created_at).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
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
