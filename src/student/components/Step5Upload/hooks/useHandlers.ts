import React, { MutableRefObject } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../../../firebaseConfig';
import { createDocument, updateDocument } from '../../../../utils/firebaseHelpers';
import { generateSubmissionFilePath, getFileExtension } from '../../../../utils/filePathHelpers';

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractYoutubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

async function verifyYoutubeVideo(url: string): Promise<{ valid: boolean; reason?: string }> {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return { valid: false, reason: 'Please enter a valid YouTube URL.' };
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (res.ok) return { valid: true };
    if (res.status === 404 || res.status === 401) {
      return { valid: false, reason: 'This video could not be found or is private on YouTube.' };
    }
    return { valid: false, reason: 'Could not verify the YouTube video. Please check the link.' };
  } catch {
    // Network error — allow submission rather than blocking on connectivity issues
    return { valid: true };
  }
}

export function useStep5UploadHandlers({
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

  const handleYoutubeLinkChange = (e, setYoutubeLink) => {
    const value = e.target.value;
    setYoutubeLink(value);
    if (value.trim() && !extractYoutubeVideoId(value)) {
      setErrorMsg('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...).');
    } else {
      setErrorMsg('');
    }
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

      const { valid, reason } = await verifyYoutubeVideo(youtubeLink.trim());
      if (!valid) throw new Error(reason);

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
    if (!justDroppedRef.current) document.getElementById('file-input-s5')?.click();
  };

  return {
    handleFileChange,
    handleYoutubeLinkChange,
    handleSubmit,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleDropZoneClick,
  };
}
