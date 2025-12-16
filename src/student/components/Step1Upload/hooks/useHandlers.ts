import { supabase } from '../../../../supabaseClient';
import { generateSubmissionFilePath, getFileExtension } from '../../../../utils/filePathHelpers';

export function useStep1UploadHandlers({
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
      const filePath = generateSubmissionFilePath(userId, projectId, 1, fileExt);

      const { error: uploadError } = await supabase.storage
        .from('student-submissions')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('student-submissions')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // Verify project ownership before inserting
      const { data: projectCheck, error: projectCheckError } = await supabase
        .from('projects')
        .select('project_id, student_id')
        .eq('project_id', projectId)
        .eq('student_id', userId)
        .single();

      if (projectCheckError || !projectCheck) {
        console.error('Project ownership verification failed:', projectCheckError);
        throw new Error('Unable to verify project ownership. Please try again.');
      }

      console.log('Attempting to insert submission:', {
        project_id: projectId,
        step_number: 1,
        file_url: fileUrl,
      });

      const { error: insertError } = await supabase.from('submissions').insert({
        project_id: projectId,
        step_number: 1,
        file_url: fileUrl,
      });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          current_step_status: 'Submitted',
          step1_status: 'Submitted',
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
