import { useState, useEffect } from 'react';
import { fetchTeachers, deleteTeacher, deleteStudent } from '../api/adminApi';
import { getDocuments, buildConstraints, deleteDocument } from '../../utils/firebaseHelpers';

interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status: 'active' | 'pending';
  invited_at?: string;
  students?: Student[];
}

interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface ConfirmState {
  open: boolean;
  id: string;
  name: string;
  type: 'teacher' | 'student';
}

export function useTeachers(showAlert: (message: string, title: string) => void) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    id: '',
    name: '',
    type: 'teacher',
  });

  const showToast = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setToastState({ open: true, message, severity });
  };

  const closeToast = () => {
    setToastState((prev) => ({ ...prev, open: false }));
  };

  const openConfirm = (id: string, name: string, type: 'teacher' | 'student' = 'teacher') => {
    setConfirmState({ open: true, id, name, type });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, id: '', name: '', type: 'teacher' });
  };

  const loadTeachers = async () => {
    setLoading(true);
    
    // Fetch active teachers
    const { data, error } = await fetchTeachers();

    console.log('Fetching teachers - Data:', data);
    console.log('Fetching teachers - Error:', error);
    console.log('Fetching teachers - Count:', data?.length);

    let activeTeachers: Teacher[] = [];

    if (error) {
      console.error('Error fetching teachers:', error);
      showAlert('Failed to load teachers: ' + error.message, 'Error');
    } else {
      // Fetch students for each teacher
      activeTeachers = await Promise.all(
        (data || []).map(async (teacher) => {
          const { data: students } = await getDocuments(
            'users',
            buildConstraints({
              eq: { teacher_id: teacher.id, user_type: 'student' },
              orderBy: { field: 'created_at', direction: 'desc' },
            })
          );

          return {
            ...teacher,
            status: 'active' as const,
            students: students || [],
          };
        })
      );
    }

    // Fetch pending invitations
    const { data: pendingInvites } = await getDocuments(
      'pending_invitations',
      buildConstraints({
        eq: { role: 'teacher', status: 'pending' },
        orderBy: { field: 'invited_at', direction: 'desc' },
      })
    );

    const pendingTeachers: Teacher[] = (pendingInvites || []).map((invite) => ({
      id: invite.id,
      email: invite.email,
      first_name: '',
      last_name: '',
      created_at: invite.invited_at || '',
      invited_at: invite.invited_at || '',
      status: 'pending' as const,
      students: [],
    }));

    // Combine active and pending teachers
    setTeachers([...activeTeachers, ...pendingTeachers]);
    setLoading(false);
  };

  const handleDelete = async (teacherId: string, teacherName: string) => {
    openConfirm(teacherId, teacherName, 'teacher');
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    openConfirm(studentId, studentName, 'student');
  };

  const confirmDelete = async () => {
    const { id, name, type } = confirmState;
    closeConfirm();

    setDeleting(true);
    console.log(`Deleting ${type}:`, id, name);

    let data, error;
    if (type === 'teacher') {
      // Check if this is a pending invitation
      const teacher = teachers.find(t => t.id === id);
      if (teacher?.status === 'pending') {
        // Delete from pending_invitations collection
        const result = await deleteDocument('pending_invitations', id);
        error = result.error;
        data = result.data;
      } else {
        // Delete active teacher
        const result = await deleteTeacher(id);
        data = result.data;
        error = result.error;
      }
    } else {
      const result = await deleteStudent(id);
      data = result.data;
      error = result.error;
    }

    console.log(`Delete ${type} - Full response:`, { data, error });

    if (error) {
      console.error(`Error deleting ${type}:`, error);
      showToast(`Failed to delete ${type}: ${error}`, 'error');
    } else {
      console.log('Delete successful, updating state...');
      showToast(`${name} has been deleted successfully`);

      // Update local state instead of reloading
      if (type === 'teacher') {
        // Remove teacher from the list
        setTeachers((prevTeachers) => prevTeachers.filter((t) => t.id !== id));
      } else {
        // Remove student from their teacher's students array
        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) => ({
            ...teacher,
            students: teacher.students?.filter((s) => s.id !== id) || [],
          }))
        );
      }
    }

    setDeleting(false);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return {
    teachers,
    loading,
    deleting,
    handleDelete,
    handleDeleteStudent,
    confirmDelete,
    refresh: loadTeachers,
    toastState,
    closeToast,
    confirmState,
    closeConfirm,
  };
}
