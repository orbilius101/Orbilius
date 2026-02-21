import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../../../firebaseConfig';
import { createDocument, updateDocument } from '../../../../utils/firebaseHelpers';
import { generateSubmissionFilePath, getFileExtension } from '../../../../utils/filePathHelpers';

export function useStep5UploadHandlers({
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

  const handleYoutubeLinkChange = (e, setYoutubeLink) => {
    setYoutubeLink(e.target.value);
  };

  const handleSubmit = async (file, youtubeLink) => {
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
      if (!youtubeLink.trim()) throw new Error('Please provide a YouTube link.');

      const fileExt = getFileExtension(file.name);
      const filePath = generateSubmissionFilePath(userId, projectId, 5, fileExt);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `student-submissions/${filePath}`);
      await uploadBytes(storageRef, file);

      // Get download URL
      const fileUrl = await getDownloadURL(storageRef);

      const { error: insertError } = await createDocument('submissions', {
        project_id: projectId,
        step_number: 5,
        file_url: fileUrl,
        youtube_link: youtubeLink.trim(),
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      const { error: updateError } = await updateDocument('projects', projectId, {
        current_step_status: 'Submitted',
        step5_status: 'Submitted',
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setStatus('Submitted');
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return {
    handleFileChange,
    handleYoutubeLinkChange,
    handleSubmit,
  };
}
