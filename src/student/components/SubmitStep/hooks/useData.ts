import { useState } from 'react';

export function useSubmitStepData() {
  const [file, setFile] = useState(null);
  const [stepNumber, setStepNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  return {
    file,
    setFile,
    stepNumber,
    setStepNumber,
    notes,
    setNotes,
    uploading,
    setUploading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
  };
}
