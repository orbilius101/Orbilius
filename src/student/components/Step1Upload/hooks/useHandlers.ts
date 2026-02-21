import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../../../firebaseConfig';
import { createDocument, getDocument, updateDocument } from '../../../../utils/firebaseHelpers';
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
      const user = auth.currentUser;

      if (!user) throw new Error('Not authenticated.');

      const userId = user.uid;

      if (!file) throw new Error('Please select a file.');

      const fileExt = getFileExtension(file.name);
      const filePath = generateSubmissionFilePath(userId, projectId, 1, fileExt);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `student-submissions/${filePath}`);
      await uploadBytes(storageRef, file, { contentType: file.type });

      // Get download URL
      const fileUrl = await getDownloadURL(storageRef);

      // Verify project ownership before inserting
      const { data: projectCheck, error: projectCheckError } = await getDocument(
        'projects',
        projectId
      );

      if (projectCheckError || !projectCheck || (projectCheck as any).student_id !== userId) {
        console.error('Project ownership verification failed:', projectCheckError);
        throw new Error('Unable to verify project ownership. Please try again.');
      }

      console.log('Attempting to insert submission:', {
        project_id: projectId,
        step_number: 1,
        file_url: fileUrl,
      });

      const { error: insertError } = await createDocument('submissions', {
        project_id: projectId,
        step_number: 1,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      const { error: updateError } = await updateDocument('projects', projectId, {
        current_step_status: 'Submitted',
        step1_status: 'Submitted',
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setStatus('Submitted');
      setFile(null);
    } catch (err: any) {
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
