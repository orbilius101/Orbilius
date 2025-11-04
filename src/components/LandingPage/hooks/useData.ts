import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orbiliusLogo from '../../../assets/merle-386x386.svg';
import { useAlert } from '../../../hooks/useAlert';

export function useLandingPageData() {
  const [showAbout, setShowAbout] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { alertState, showAlert, closeAlert } = useAlert();

  return {
    showAbout,
    setShowAbout,
    searchParams,
    navigate,
    orbiliusLogo,
    showAlert,
    alertState,
    closeAlert,
  };
}
