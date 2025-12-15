import { useState, useEffect } from 'react';
import { fetchTeachers, deleteTeacher } from '../api/adminApi';
import { supabase } from '../../supabaseClient';

interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
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
  teacherId: string;
  teacherName: string;
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
    teacherId: '',
    teacherName: '',
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

  const openConfirm = (teacherId: string, teacherName: string) => {
    setConfirmState({ open: true, teacherId, teacherName });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, teacherId: '', teacherName: '' });
  };

  const loadTeachers = async () => {
    setLoading(true);
    const { data, error } = await fetchTeachers();

    console.log('Fetching teachers - Data:', data);
    console.log('Fetching teachers - Error:', error);
    console.log('Fetching teachers - Count:', data?.length);

    if (error) {
      console.error('Error fetching teachers:', error);
      showAlert('Failed to load teachers: ' + error.message, 'Error');
      setTeachers([]);
    } else {
      // Fetch students for each teacher
      const teachersWithStudents = await Promise.all(
        (data || []).map(async (teacher) => {
          const { data: students } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, created_at')
            .eq('teacher_id', teacher.id)
            .eq('user_type', 'student')
            .order('created_at', { ascending: false });

          return {
            ...teacher,
            students: students || [],
          };
        })
      );
      setTeachers(teachersWithStudents);
    }

    setLoading(false);
  };

  const handleDelete = async (teacherId: string, teacherName: string) => {
    openConfirm(teacherId, teacherName);
  };

  const confirmDelete = async () => {
    const { teacherId, teacherName } = confirmState;
    closeConfirm();

    setDeleting(true);
    console.log('Deleting teacher:', teacherId, teacherName);

    const { data, error } = await deleteTeacher(teacherId);

    console.log('Delete teacher - Full response:', { data, error });
    console.log('Delete teacher - Data:', data);
    console.log('Delete teacher - Error:', error);

    if (error) {
      console.error('Error deleting teacher:', error);
      showToast(`Failed to delete teacher: ${error.message}`, 'error');
    } else {
      console.log('Delete successful, reloading teachers...');
      showToast(`${teacherName} has been deleted successfully`);
      // Reload teachers list
      await loadTeachers();
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
    confirmDelete,
    refresh: loadTeachers,
    toastState,
    closeToast,
    confirmState,
    closeConfirm,
  };
}
