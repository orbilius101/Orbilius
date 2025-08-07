import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function SubmissionUploadForm({ projectId }) {
  const [file, setFile] = useState(null);
  const [stepNumber, setStepNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) throw new Error('Not authenticated.');

      const userId = session.user.id;

      if (!file || !stepNumber) throw new Error('File and Step Number are required.');

      const fileExt = file.name.split('.').pop().toLowerCase();
      const filePath = `submissions/${projectId}/${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('student-submissions')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;
      const stepNum = parseInt(stepNumber);

      const { error: insertError } = await supabase.from('submissions').insert({
        project_id: projectId,
        uploaded_by: userId,
        step_number: stepNum,
        file_url: fileUrl,
        notes: notes,
      });

      if (insertError) throw insertError;

      const stepField = `step${stepNum}_status`;

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_step_status: 'Submitted',
          [stepField]: 'Submitted',
        })
        .eq('project_id', projectId);

      if (updateError) throw updateError;

      setSuccess(true);
      setFile(null);
      setNotes('');
      setStepNumber('');
    } catch (err) {
      console.error(err.message);
      setErrorMsg(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <form
        onSubmit={handleUpload}
        style={{
          width: '100%',
          maxWidth: '600px',
          background: '#f9f9f9',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem' }}>Upload Submission</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>PDF File:</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} required />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Step Number (1–5):</label>
          <input
            type="number"
            value={stepNumber}
            onChange={(e) => setStepNumber(e.target.value)}
            min="1"
            max="5"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes (optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          style={{
            backgroundColor: '#007BFF',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </button>

        {success && <p style={{ color: 'green', marginTop: '1rem' }}>Submission uploaded successfully!</p>}
        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
      </form>
    </div>
  );
}
