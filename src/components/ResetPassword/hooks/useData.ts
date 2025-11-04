import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../hooks/useAlert';

export function useResetPasswordData() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    setLoading,
    error,
    setError,
    navigate,
    showAlert,
    alertState,
    closeAlert,
  };
}
