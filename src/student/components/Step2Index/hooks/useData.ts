import { storage } from '../../../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

export function useStep2IndexData() {
  const getDesignBriefUrl = async () => {
    try {
      const fileRef = ref(storage, 'resources/step2/OPM Project Design Brief.pdf');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting design brief URL:', error);
      return null;
    }
  };

  const getDesignBriefInstructionsUrl = async () => {
    try {
      const fileRef = ref(storage, 'resources/step2/OPM Project Design Brief.pdf');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting instructions URL:', error);
      return null;
    }
  };

  return {
    getDesignBriefUrl,
    getDesignBriefInstructionsUrl,
  };
}
