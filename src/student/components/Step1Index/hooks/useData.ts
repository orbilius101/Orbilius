import { storage } from '../../../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { useAlert } from '../../../../hooks/useAlert';

export function useStep1IndexData() {
  const { alertState, showAlert, closeAlert } = useAlert();

  const getDiscoveryLogUrl = async () => {
    try {
      const fileRef = ref(storage, 'resources/step1/Orbilius PM The Discovery Log.pdf');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting discovery log URL:', error);
      return null;
    }
  };

  const getInstructionsUrl = async () => {
    try {
      const fileRef = ref(storage, 'resources/step1/Orbilius PM Discovery Log Instructions.pdf');
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting instructions URL:', error);
      return null;
    }
  };

  return {
    getDiscoveryLogUrl,
    getInstructionsUrl,
    alertState,
    showAlert,
    closeAlert,
  };
}
