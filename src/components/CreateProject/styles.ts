import { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f8f8',
  },
  card: {
    padding: '2rem',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '1rem',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  timeline: {
    padding: '1rem',
    backgroundColor: '#f0f8ff',
    borderRadius: '5px',
    border: '1px solid #d0d7de',
  },
  timelineTitle: {
    margin: '0 0 0.5rem 0',
    color: '#333',
  },
  timelineText: {
    margin: '0',
    fontSize: '0.9rem',
    color: '#666',
  },
  timelineList: {
    margin: '0.5rem 0 0 1rem',
    fontSize: '0.85rem',
    color: '#555',
  },
  button: {
    padding: '0.75rem',
    borderRadius: '5px',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
};
