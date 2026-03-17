import { useState, useEffect } from 'react';
import { fetchTeachers, deleteTeacher, deleteStudent } from '../api/adminApi';
import {
  getDocuments,
  buildConstraints,
  deleteDocument,
  getDocument,
} from '../../utils/firebaseHelpers';

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
  status: 'active' | 'pending';
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
    status: 'active',
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

  const openConfirm = (
    id: string,
    name: string,
    type: 'teacher' | 'student' = 'teacher',
    status: 'active' | 'pending' = 'active'
  ) => {
    setConfirmState({ open: true, id, name, type, status });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, id: '', name: '', type: 'teacher', status: 'active' });
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

          // Convert student timestamps to ISO strings
          const studentsWithDates = (students || []).map((student: any) => ({
            ...student,
            created_at: student.created_at?.toDate
              ? student.created_at.toDate().toISOString()
              : student.created_at,
          }));

          return {
            ...teacher,
            status: 'active' as const,
            students: studentsWithDates,
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

    const pendingTeachers: Teacher[] = (pendingInvites || []).map((invite) => {
      const invitedDate = invite.invited_at?.toDate
        ? invite.invited_at.toDate()
        : new Date(invite.invited_at || Date.now());
      return {
        id: invite.id,
        email: invite.email,
        first_name: '',
        last_name: '',
        created_at: invitedDate.toISOString(),
        invited_at: invitedDate.toISOString(),
        status: 'pending' as const,
        students: [],
      };
    });

    // Combine active and pending teachers
    setTeachers([...activeTeachers, ...pendingTeachers]);
    setLoading(false);
  };

  const handleDelete = async (
    teacherId: string,
    teacherName: string,
    status: 'active' | 'pending' = 'active'
  ) => {
    openConfirm(teacherId, teacherName, 'teacher', status);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    openConfirm(studentId, studentName, 'student', 'active');
  };

  const confirmDelete = async () => {
    const { id, name, type } = confirmState;
    closeConfirm();

    setDeleting(true);
    console.log(`Deleting ${type}:`, id, name);

    let data, error;
    if (type === 'teacher') {
      // Check if this is a pending invitation
      const teacher = teachers.find((t) => t.id === id);
      if (teacher?.status === 'pending') {
        // Delete from pending_invitations collection
        console.log('Deleting pending invitation:', id);
        const result = await deleteDocument('pending_invitations', id);
        error = result.error;
        data = result.data;
        console.log('Pending invitation delete result:', { data, error });
      } else {
        // Delete active teacher via Cloud Function
        console.log('Deleting active teacher via Cloud Function:', id);
        const result = await deleteTeacher(id);
        data = result.data;
        error = result.error;
        console.log('Active teacher delete result:', { data, error });
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
      showAlert(`Failed to delete ${type}: ${error}`, 'Error');
      setDeleting(false);
      return;
    }

    // Verify the deletion actually worked before updating UI
    console.log('Verifying deletion...');
    const collection =
      type === 'teacher'
        ? teachers.find((t) => t.id === id)?.status === 'pending'
          ? 'pending_invitations'
          : 'users'
        : 'users';

    const verifyResult = await getDocument(collection, id);

    if (verifyResult.data) {
      // Document still exists - deletion failed
      console.error(`${type} still exists after deletion attempt:`, verifyResult.data);
      showToast(`Failed to delete ${type}: Record still exists in database`, 'error');
      showAlert(
        `Failed to delete ${type}: The deletion did not complete. Please try again.`,
        'Error'
      );
      setDeleting(false);
      return;
    }

    console.log('Delete verified successful, removing from UI...');
    showToast(`${name} has been deleted successfully`);

    // Remove the deleted teacher/student from the local state
    if (type === 'teacher') {
      setTeachers((prevTeachers) => prevTeachers.filter((t) => t.id !== id));
    } else {
      // For students, remove from their teacher's student list
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) => ({
          ...teacher,
          students: teacher.students.filter((s) => s.id !== id),
        }))
      );
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
