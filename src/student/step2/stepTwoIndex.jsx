import { useNavigate } from 'react-router-dom';

export default function Step2Overview() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button 
          onClick={() => navigate('/student/dashboard')} 
          style={styles.backButton}
        >
          ← Back to Dashboard
        </button>
        
        <h2 style={styles.title}>Project Cycle Phases<br />Step 2: Design Brief</h2>
        <p style={styles.paragraph}>
          You've done your initial research and are now ready to commit to a project! 
          This is where the Design Brief comes in! A design brief allows you to 
          sketch out a shared understanding of the project. <strong>Don't worry about 
          getting this perfect.</strong> Give us what you've got. It's natural for projects 
          to change course as the work evolves. If that happens, talk to your teacher 
          and simply readjust the design brief and your planning documents!
        </p>

        <div style={styles.linksContainer}>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Get Started!!!</strong>
            <button style={styles.button}>Download Step 2: Design Brief</button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Help!!!</strong>
            <button style={styles.button}>How Do I Create A Design Brief?</button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Ready to Submit Step 2?</strong>
            <a href="/student/step2/stepTwoUpload">
              <button style={styles.button}>Upload Your Project Design Brief Here.</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    color: '#111111',
    minHeight: '100vh',
    padding: '4rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '48px',
    marginBottom: '2.5rem',
    lineHeight: '1.2',
    color: '#111111',
  },
  paragraph: {
    fontSize: '22px',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    color: '#333333',
  },
  strong: {
    fontSize: '20px',
    display: 'block',
    marginBottom: '1rem',
  },
  linksContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '3rem',
    gap: '2rem',
  },
  linkBox: {
    width: '30%',
    marginBottom: '2rem',
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
  },
  button: {
    width: '100%',
    padding: '1.5rem',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    minHeight: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flex: '1',
  },
  backButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#f8f9fa',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '2rem',
    color: '#495057',
    transition: 'all 0.2s',
  },
};
