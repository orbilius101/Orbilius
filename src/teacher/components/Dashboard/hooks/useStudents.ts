import { useState, useEffect } from 'react';
import { getDocuments, buildConstraints, deleteDocument } from '../../../../utils/firebaseHelpers';

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status: 'active' | 'pending';
  invited_at?: string;
}

interface ConfirmState {
  open: boolean;
  id: string;
  name: string;
  type: 'student';
}

export function useStudents(teacherId: string | undefined, showAlert: (message: string, title: string) => void) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    id: '',
    name: '',
    type: 'student',
  });

  const openConfirm = (id: string, name: string) => {
    setConfirmState({ open: true, id, name, type: 'student' });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, id: '', name: '', type: 'student' });
  };

  const loadStudents = async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    console.log('useStudents: Loading students for teacher:', teacherId);
    
    // Fetch active students
    const { data: activeStudentsData, error } = await getDocuments(
      'users',
      buildConstraints({
        eq: { teacher_id: teacherId, user_type: 'student' },
        orderBy: { field: 'created_at', direction: 'desc' },
      })
    );

    let activeStudents: Student[] = [];

    if (error) {
      console.error('Error fetching students:', error);
      showAlert('Failed to load students: ' + error.message, 'Error');
    } else {
      console.log('useStudents: Found active students:', activeStudentsData?.length || 0);
      activeStudents = (activeStudentsData || []).map((student) => ({
        id: student.id,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        created_at: student.created_at,
        status: 'active' as const,
      }));
    }

    // Fetch pending invitations for students
    console.log('useStudents: Fetching pending invitations for teacher:', teacherId);
    try {
      // First, try to fetch with all constraints
      let pendingInvites = null;
      let inviteError = null;
      
      try {
        const result = await getDocuments(
          'pending_invitations',
          buildConstraints({
            eq: { role: 'student', status: 'pending', teacher_id: teacherId },
            orderBy: { field: 'invited_at', direction: 'desc' },
          })
        );
        pendingInvites = result.data;
        inviteError = result.error;
      } catch (queryError) {
        console.error('Error with full query, trying simpler query:', queryError);
        // If that fails, try without ordering
        const result = await getDocuments(
          'pending_invitations',
          buildConstraints({
            eq: { role: 'student', status: 'pending', teacher_id: teacherId },
          })
        );
        pendingInvites = result.data;
        inviteError = result.error;
      }

      if (inviteError) {
        console.error('Error fetching pending invitations:', inviteError);
        console.error('Error message:', inviteError.message);
        showAlert('Failed to load pending invitations: ' + inviteError.message, 'Error');
        // Still show active students even if pending invitations fail
        setStudents(activeStudents);
      } else {
        console.log('useStudents: Found pending invitations:', pendingInvites?.length || 0);
        
        const pendingStudents: Student[] = (pendingInvites || []).map((invite) => {
          const invitedDate = invite.invited_at?.toDate ? invite.invited_at.toDate() : new Date(invite.invited_at || Date.now());
          return {
            id: invite.id,
            email: invite.email,
            first_name: '',
            last_name: '',
            created_at: '',
            status: 'pending' as const,
            invited_at: invitedDate.toISOString(),
          };
        });

        // Merge active students and pending invitations
        setStudents([...pendingStudents, ...activeStudents]);
      }
    } catch (err) {
      console.error('Exception fetching pending invitations:', err);
      showAlert('Failed to load pending invitations: ' + (err instanceof Error ? err.message : String(err)), 'Error');
      // Still show active students even if pending invitations fail
      setStudents(activeStudents);
    }
    
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!confirmState.id) return;

    setDeleting(true);

    try {
      const studentToDelete = students.find((s) => s.id === confirmState.id);
      
      if (studentToDelete?.status === 'pending') {
        // Delete pending invitation
        const { error } = await deleteDocument('pending_invitations', confirmState.id);
        
        if (error) {
          showAlert('Failed to delete invitation: ' + error.message, 'Error');
        } else {
          showAlert('Invitation deleted successfully', 'Success');
          await loadStudents();
        }
      } else {
        // For active students, we would need to implement a delete function
        // that removes the student and their associated projects
        showAlert('Deleting active students is not yet implemented', 'Info');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      showAlert('Failed to delete: ' + (error instanceof Error ? error.message : String(error)), 'Error');
    } finally {
      setDeleting(false);
      closeConfirm();
    }
  };

  useEffect(() => {
    loadStudents();
  }, [teacherId]);

  return {
    students,
    loading,
    deleting,
    confirmState,
    openConfirm,
    closeConfirm,
    confirmDelete,
    loadStudents,
  };
}
