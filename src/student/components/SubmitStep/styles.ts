import { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },
  form: {
    width: '100%',
    maxWidth: '600px',
    background: '#f9f9f9',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
  },
  button: {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  successMessage: {
    color: 'green',
    marginTop: '1rem',
  },
  errorMessage: {
    color: 'red',
    marginTop: '1rem',
  },
};
