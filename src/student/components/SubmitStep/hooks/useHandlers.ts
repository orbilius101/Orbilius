import { supabase } from '../../../../supabaseClient';

export function useSubmitStepHandlers({
  setFile,
  setUploading,
  setErrorMsg,
  setSuccess,
  setNotes,
  setStepNumber,
}) {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e, file, stepNumber, notes, projectId) => {
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

  return {
    handleFileChange,
    handleUpload,
  };
}
