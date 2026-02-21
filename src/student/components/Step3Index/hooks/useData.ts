import { storage } from '../../../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

export function useStep3IndexData() {
  const getPlanningDocsUrl = async () => {
    try {
      const fileRef = ref(storage, 'resources/step3/OPM Step 3 Work Breakdown Structure.pdf');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting planning docs URL:', error);
      return null;
    }
  };

  return {
    getPlanningDocsUrl,
  };
}
