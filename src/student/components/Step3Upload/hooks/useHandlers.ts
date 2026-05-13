import React, { MutableRefObject } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../../../firebaseConfig';
import { createDocument, updateDocument } from '../../../../utils/firebaseHelpers';
import { generateSubmissionFilePath, getFileExtension } from '../../../../utils/filePathHelpers';

export function useStep3UploadHandlers({
  projectId,
  setFile,
  setUploading,
  setErrorMsg,
  setSuccess,
  setStatus,
  setIsDragging,
  dragCounterRef,
  justDroppedRef,
}: {
  projectId: string | null
  setFile: (f: any) => void
  setUploading: (v: boolean) => void
  setErrorMsg: (msg: string) => void
  setSuccess: (v: boolean) => void
  setStatus: (s: string) => void
  setIsDragging: (v: boolean) => void
  dragCounterRef: MutableRefObject<number>
  justDroppedRef: MutableRefObject<boolean>
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
      const filePath = generateSubmissionFilePath(userId, projectId, 3, fileExt);

      const storageRef = ref(storage, `student-submissions/${filePath}`);
      await uploadBytes(storageRef, file);

      const fileUrl = await getDownloadURL(storageRef);

      const { error: insertError } = await createDocument('submissions', {
        project_id: projectId,
        step_number: 3,
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      const { error: updateError } = await updateDocument('projects', projectId, {
        current_step_status: 'Submitted',
        step3_status: 'Submitted',
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

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    dragCounterRef.current = 0;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    justDroppedRef.current = true;
    setTimeout(() => { justDroppedRef.current = false; }, 300);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    handleFileChange({ target: { files: [dropped], value: '' } } as any);
  };

  const handleDropZoneClick = () => {
    if (!justDroppedRef.current) document.getElementById('file-input-s3')?.click();
  };

  return {
    handleFileChange,
    handleUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleDropZoneClick,
  };
}
