import { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#ffffff',
    color: '#111111',
    minHeight: '100vh',
    padding: '3rem',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '0.1rem',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#111111',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontWeight: '400',
    transition: 'color 0.2s',
  },
  navButtonActive: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#007bff',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    gap: '8rem',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '0.0001rem',
  },
  leftSection: {
    flex: 1,
    paddingRight: '3rem',
    maxWidth: '500px',
  },
  titleSection: {
    textAlign: 'left' as const,
  },
  title: {
    fontSize: '90px',
    fontWeight: '300',
    lineHeight: '1.0',
    margin: '0 0 1.5rem 0',
    color: '#111111',
  },
  subtitle: {
    fontSize: '32px',
    color: '#666666',
    margin: 0,
    fontWeight: '300',
  },
  aboutSection: {
    textAlign: 'left' as const,
    maxWidth: '500px',
  },
  aboutTitle: {
    fontSize: '32px',
    fontWeight: '600',
    marginBottom: '2rem',
    color: '#111111',
    lineHeight: '1.3',
  },
  aboutText: {
    fontSize: '18px',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    color: '#333333',
  },
  signature: {
    marginTop: '2rem',
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '450px',
  },
  logo: {
    width: '400px',
    height: '400px',
  },
};
