import { useNavigate } from 'react-router-dom';

export default function Step5Overview() {
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
        
        <h2 style={styles.title}>Project Cycle Phases<br />Step 5: Closeout the Project!</h2>
        <p style={styles.paragraph}>
          You've finished your project, but you're not done yet! There is one last, most important step to complete to closeout your project effective. It's called an Archival Record and it is, without question, your moment to shine. You've just spent how many weeks or months working on this project? Take a few days to pull together this final documentation in order to share this fantastic work with the world.
        </p>
        <p style={styles.paragraph}>
          You'll be creating a 3-5 minute video, capturing the project and reflecting up your work. Spend time to make this a well-produced video that you'd be proud to share with others. We're going to ask you to upload this video to YouTube and share the link with us.
        </p>

        <div style={styles.linksContainer}>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Get Started!!!</strong>
            <button style={styles.button}>Download Step 5: Closeout - Archival Records Document</button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Help!!!</strong>
            <button style={styles.button}>What is an Archival Record?</button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Ready to Submit Step 5?</strong>
            <a href="/student/step5/stepFiveUpload">
              <button style={styles.button}>Upload Your Closeout - Archival Record Document Here.</button>
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
