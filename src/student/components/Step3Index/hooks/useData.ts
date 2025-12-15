import { supabase } from '../../../../supabaseClient';

export function useStep3IndexData() {
  const getPlanningDocsUrl = () => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl('step3/OPM Step 3 Work Breakdown Structure.pdf');
    return data;
  };

  return {
    getPlanningDocsUrl,
  };
}
