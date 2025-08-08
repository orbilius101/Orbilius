import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Navigation Header */}
        <div style={styles.header}>
          <div style={styles.nav}>
            <button 
              onClick={() => setShowAbout(!showAbout)}
              style={showAbout ? styles.navButtonActive : styles.navButton}
            >
              About
            </button>
            <button 
              onClick={() => navigate('/signup')}
              style={styles.navButton}
            >
              Sign Up
            </button>
            <button 
              onClick={() => navigate('/login')}
              style={styles.navButton}
            >
              Login
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Left Section - Title or About Content */}
          <div style={styles.leftSection}>
            {!showAbout ? (
              // Title Section
              <div style={styles.titleSection}>
                <h1 style={styles.title}>
                  Orbilius<br />
                  Project<br />
                  Management
                </h1>
                <p style={styles.subtitle}>(Orbilius PM)</p>
              </div>
            ) : (
              // About Section
              <div style={styles.aboutSection}>
                <h2 style={styles.aboutTitle}>About the Orbilius Project Management (Orbilius PM) Pilot</h2>
                
                <p style={styles.aboutText}>
                  The Orbilius PM Pilot is a limited-run program exploring new ways to support deep, student-driven learning. Partnering with a small group of educators, we're testing a streamlined platform that supports meaningful, independent student work under teacher guidance.
                </p>
                
                <p style={styles.aboutText}>
                  This early phase is focused on simplicity, trust, and clarity—providing students with space to pursue purposeful learning while giving educators tools to guide and support them. Our hope is to keep the focus centered on fluid communication between the teacher and student from inception to project completion. Feedback from this pilot will directly shape how we grow the platform, improve its design, and ensure that it remains rooted in what matters most: the learning process itself.
                </p>
                
                <p style={styles.aboutText}>
                  If you're part of this pilot, you're helping us imagine what authentic recognition of student work could look like—without adding unnecessary friction to your role as an educator. If you work with students on individualized projects—whether in your own classroom or as a part of a program at your school—and would like to join the pilot, please email us at hello@orbilius.org to talk.
                </p>
                
                <p style={styles.aboutText}>
                  From the very bottom of our hearts, thank you for everything you do for those students.
                </p>
                
                <div style={styles.signature}>
                  <p style={styles.aboutText}>Sincerely,</p>
                  <p style={styles.aboutText}>The Orbilius Team</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Placeholder graphic */}
          <div style={styles.rightSection}>
            <div style={styles.placeholderGraphic}>
              {/* Simple geometric design */}
              <div style={styles.graphicElement}></div>
            </div>
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
    padding: '3rem',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
    textAlign: 'left',
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
    textAlign: 'left',
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
  placeholderGraphic: {
    width: '400px',
    height: '400px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  graphicElement: {
    width: '300px',
    height: '300px',
    background: 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)',
    transform: 'rotate(45deg)',
    borderRadius: '20px',
  },
};
