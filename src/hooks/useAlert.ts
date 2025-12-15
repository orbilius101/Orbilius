import { useState, useCallback } from 'react';

export interface AlertState {
  open: boolean;
  title?: string;
  message: string;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    title: '',
    message: '',
  });

  const showAlert = useCallback((message: string, title?: string) => {
    setAlertState({
      open: true,
      message,
      title: title || 'Alert',
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  return { alertState, showAlert, closeAlert };
}
