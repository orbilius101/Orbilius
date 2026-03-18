import { useCallback } from 'react';
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
  const handleFileChange = useCallback(
    async (e) => {
      const selected = e.target.files[0];
      if (!selected) return;
      // Validate PDF magic bytes (%PDF-)
      const header = await selected.slice(0, 5).arrayBuffer();
      const magic = new Uint8Array(header);
      const isPdf =
        magic[0] === 0x25 &&
        magic[1] === 0x50 &&
        magic[2] === 0x44 &&
        magic[3] === 0x46 &&
        magic[4] === 0x2d;
      if (!isPdf) {
        setErrorMsg('Invalid file. Please upload a valid PDF.');
        e.target.value = '';
        return;
      }
      setErrorMsg('');
      setFile(selected);
    },
    [setFile, setErrorMsg]
  );

  const handleUpload = useCallback(
    async (file) => {
      console.log('Step1Upload - handleUpload called with projectId:', projectId);

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
    },
    [projectId, setErrorMsg, setUploading, setSuccess, setStatus, setFile]
  );

  return {
    handleFileChange,
    handleUpload,
  };
}
