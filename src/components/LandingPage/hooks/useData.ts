import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import orbiliusLogoYellow from '../../../assets/merle-386x386-yellow.svg';
import orbiliusLogoDark from '../../../assets/merle-386x386.svg';
import { useAlert } from '../../../hooks/useAlert';

export function useLandingPageData() {
  const [showAbout, setShowAbout] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { alertState, showAlert, closeAlert } = useAlert();

  const orbiliusLogo = theme.palette.mode === 'dark' ? orbiliusLogoYellow : orbiliusLogoDark;

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
