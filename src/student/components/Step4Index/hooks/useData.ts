import { storage } from '../../../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

export function useStep4IndexData() {
  const getAnnotatedBibliographyUrl = async () => {
    try {
      const fileRef = ref(storage, 'resources/step4/OPM Step 4 Annotated Bibliography.pdf');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting annotated bibliography URL:', error);
      return null;
    }
  };

  return {
    getAnnotatedBibliographyUrl,
  };
}
