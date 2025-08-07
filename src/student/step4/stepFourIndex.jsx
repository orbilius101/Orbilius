import { useNavigate } from 'react-router-dom';

export default function Step4Overview() {
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
        
        <h2 style={styles.title}>Project Cycle Phases<br />Step 4: Implementation!!!</h2>
        <p style={styles.paragraph}>
          It's time to get to work! As you move into this phase of the project, you are inevitably going to hit deeper into the research of your project. So we're going to ask you to maintain an annotated bibliography to capture your learning. See the help button below for detail.
        </p>
        <p style={styles.paragraph}>
          During this step, you'll also want to make sure you are documenting the work you're doing. Be sure to take good photos and video of the work in progress. These documents will be so important for the final video that you are going to create in the last step of the project.
        </p>
        <p style={styles.paragraph}>
          Create a folder and store your documentation. Trust us, you won't regret it.
        </p>

        <div style={styles.linksContainer}>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Get Started!!!</strong>
            <button style={styles.button}>Download Step 4: Implementation - Annotated Bibliography</button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Help!!!</strong>
            <button style={styles.button}>How Do I Create An Annotated Bibliography?</button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Ready to Submit Step 4?</strong>
            <a href="/student/step4/stepFourUpload">
              <button style={styles.button}>Upload Your Annotated Bibliography Here.</button>
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
