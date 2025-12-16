import { supabase } from '../../../../supabaseClient';
import { generateSubmissionFilePath, getFileExtension } from '../../../../utils/filePathHelpers';

export function useStep2UploadHandlers({
  projectId,
  setFile,
  setUploading,
  setErrorMsg,
  setSuccess,
  setStatus,
}) {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (file) => {
    if (!projectId) {
      setErrorMsg('Project not loaded. Please try refreshing the page.');
      return;
    }

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

      if (!file) throw new Error('Please select a file.');

      const fileExt = getFileExtension(file.name);
      const filePath = generateSubmissionFilePath(userId, projectId, 2, fileExt);

      const { error: uploadError } = await supabase.storage
        .from('student-submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('student-submissions')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('submissions').insert({
        project_id: projectId,
        step_number: 2,
        file_url: fileUrl,
      });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_step_status: 'Submitted',
          step2_status: 'Submitted',
        })
        .eq('project_id', projectId);

      if (updateError) throw updateError;

      setSuccess(true);
      setStatus('Submitted');
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return {
    handleFileChange,
    handleUpload,
  };
}
