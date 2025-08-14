import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Step1Overview() {
  const navigate = useNavigate();

  const handleDownloadBibliography = async () => {
    try {
      // Get the public URL for the bibliography template
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl('step1/Orbilius PM The Discovery Log.pdf');

      if (data?.publicUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.publicUrl;
        link.download = 'Orbilius-PM-The-Discovery-Log.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Discovery Log template not found. Please contact your teacher.');
      }
    } catch (error) {
      console.error('Error downloading discovery log:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleDownloadHelpGuide = async () => {
    try {
      // Get the public URL for the help guide
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl('step1/Orbilius PM Discovery Log Instructions.pdf');

      if (data?.publicUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.publicUrl;
        link.download = 'Orbilius-PM-Discovery-Log-Instructions.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Discovery Log instructions not found. Please contact your teacher.');
      }
    } catch (error) {
      console.error('Error downloading instructions:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button 
          onClick={() => navigate('/student/dashboard')} 
          style={styles.backButton}
        >
          ← Back to Dashboard
        </button>
        
        <h2 style={styles.title}>Project Cycle Phases<br />Step 1: Initial Research</h2>
        <p style={styles.paragraph}>
          Before committing to your project, we ask you to do 2–4 weeks of initial research into your area of interest.
          Remain open to the possibility that you might discover something even cooler to work on or might be able to add
          an interesting angle to the project that you haven't considered before.
        </p>
        <p style={styles.paragraph}>
          Keep a running list of the best sources that you are finding and enter them in your Initial Research bibliography below.
        </p>

        <div style={styles.linksContainer}>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Get Started!!!</strong>
            <button onClick={handleDownloadBibliography} style={styles.button}>
              Download Step 1: The Discovery Log
            </button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Help!!!</strong>
            <button onClick={handleDownloadHelpGuide} style={styles.button}>
              Discovery Log Instructions
            </button>
          </div>
          <div style={styles.linkBox}>
            <strong style={styles.strong}>Ready to Submit Step 1?</strong>
            <a href="/student/step1/stepOneUpload">
              <button style={styles.button}>Upload Your Discovery Log Here.</button>
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