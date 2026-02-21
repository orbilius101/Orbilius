import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupData } from '../../../types';
import { useAlert } from '../../../hooks/useAlert';

export function useSignupData(): SignupData & { alertState: any; closeAlert: () => void } {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [teacherId, setTeacherId] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teacherIdParam = params.get('teacherId');
    if (teacherIdParam) {
      setTeacherId(teacherIdParam);
      setRole('student');
    }
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    teacherId,
    setTeacherId,
    adminCode,
    setAdminCode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading,
    setLoading,
    navigate,
    showAlert,
    alertState,
    closeAlert,
  };
}
