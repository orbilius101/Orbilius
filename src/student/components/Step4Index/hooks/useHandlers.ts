export function useStep4IndexHandlers({ getAnnotatedBibliographyUrl }: any) {
  const handleDownloadAnnotatedBibliography = async () => {
    const url = await getAnnotatedBibliographyUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'OPM Step 4 Annotated Bibliography.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    handleDownloadAnnotatedBibliography,
  };
}
