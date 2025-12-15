import { supabase } from '../../../../supabaseClient';

export function useStep2IndexData() {
  const getDesignBriefUrl = () => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl('step2/OPM Project Design Brief.pdf');
    return data;
  };

  const getDesignBriefInstructionsUrl = () => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl('step2/OPM Project Design Brief.pdf');
    return data;
  };

  return {
    getDesignBriefUrl,
    getDesignBriefInstructionsUrl,
  };
}
