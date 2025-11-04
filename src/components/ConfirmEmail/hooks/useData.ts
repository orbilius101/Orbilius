import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function useConfirmEmailData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return {
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    navigate,
    searchParams,
  };
}
