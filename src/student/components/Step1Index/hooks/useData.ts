import { supabase } from '../../../../supabaseClient';
import { useAlert } from '../../../../hooks/useAlert';

export function useStep1IndexData() {
  const { alertState, showAlert, closeAlert } = useAlert();

  const getDiscoveryLogUrl = () => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl('step1/Orbilius PM The Discovery Log.pdf');
    return data?.publicUrl;
  };

  const getInstructionsUrl = () => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl('step1/Orbilius PM Discovery Log Instructions.pdf');
    return data?.publicUrl;
  };

  return {
    getDiscoveryLogUrl,
    getInstructionsUrl,
    alertState,
    showAlert,
    closeAlert,
  };
}
