import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginData } from '../../../types';
import { useAlert } from '../../../hooks/useAlert';

export function useLoginData(): LoginData & { alertState: any; closeAlert: () => void } {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
    resetLoading,
    setResetLoading,
    navigate,
    showAlert,
    alertState,
    closeAlert,
  };
}
