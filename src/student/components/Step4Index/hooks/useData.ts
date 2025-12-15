import { supabase } from '../../../../supabaseClient';

export function useStep4IndexData() {
  const getAnnotatedBibliographyUrl = () => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl('step4/OPM Step 4 Annotated Bibliography.pdf');
    return data;
  };

  return {
    getAnnotatedBibliographyUrl,
  };
}
