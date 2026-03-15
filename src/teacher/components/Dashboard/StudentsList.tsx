import React from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status: 'active' | 'pending';
  invited_at?: string;
}

interface StudentsListProps {
  students: Student[];
  onDelete: (studentId: string, studentName: string) => void;
  onResendInvitation?: (email: string) => void;
}

export default function StudentsList({ students, onDelete, onResendInvitation }: StudentsListProps) {
  if (students.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No students found.
        </Typography>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => {
            const displayName = student.status === 'pending' 
              ? student.email 
              : `${student.first_name} ${student.last_name}`;

            return (
              <TableRow key={student.id} hover>
                <TableCell>{displayName}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Chip
                    label={student.status === 'pending' ? 'Invitation Sent' : 'Active'}
                    color={student.status === 'pending' ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {student.status === 'pending'
                    ? formatDate(student.invited_at || '')
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
                    <Tooltip title={student.status === 'pending' ? 'Delete invitation' : 'Delete student'}>
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
