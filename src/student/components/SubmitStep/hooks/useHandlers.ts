import { auth, storage } from '../../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createDocument, updateDocument } from '../../../../utils/firebaseHelpers';

export function useSubmitStepHandlers({
  setFile,
  setUploading,
  setErrorMsg,
  setSuccess,
  setNotes,
  setStepNumber,
}) {
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
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
  };

  const handleUpload = async (e, file, stepNumber, notes, projectId) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) throw new Error('Not authenticated.');

      const userId = currentUser.uid;

      if (!file || !stepNumber) throw new Error('File and Step Number are required.');

      const fileExt = file.name.split('.').pop().toLowerCase();
      const filePath = `submissions/${projectId}/${userId}_${Date.now()}.${fileExt}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);

      const fileUrl = await getDownloadURL(storageRef);
      const stepNum = parseInt(stepNumber);

      const { error: insertError } = await createDocument('submissions', {
        project_id: projectId,
        step_number: stepNum,
        file_url: fileUrl,
        notes: notes,
      });

      if (insertError) throw insertError;

      const stepField = `step${stepNum}_status`;

      const { error: updateError } = await updateDocument('projects', projectId, {
        current_step_status: 'Submitted',
        [stepField]: 'Submitted',
      });

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
