import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../../../firebaseConfig';
import { createDocument, updateDocument } from '../../../../utils/firebaseHelpers';
import { generateSubmissionFilePath, getFileExtension } from '../../../../utils/filePathHelpers';

export function useStep4UploadHandlers({
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
      const user = auth.currentUser;

      if (!user) throw new Error('Not authenticated.');

      const userId = user.uid;

      if (!file) throw new Error('Please select a file.');

      const fileExt = getFileExtension(file.name);
      const filePath = generateSubmissionFilePath(userId, projectId, 4, fileExt);

      const storageRef = ref(storage, `student-submissions/${filePath}`);
      await uploadBytes(storageRef, file);

      const fileUrl = await getDownloadURL(storageRef);

      const { error: insertError } = await createDocument('submissions', {
        project_id: projectId,
        step_number: 4,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      const { error: updateError } = await updateDocument('projects', projectId, {
        current_step_status: 'Submitted',
        step4_status: 'Submitted',
      });

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
