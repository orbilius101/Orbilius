export function useStep4IndexHandlers({ getAnnotatedBibliographyUrl }: any) {
  const handleDownloadAnnotatedBibliography = () => {
    const urlData = getAnnotatedBibliographyUrl();
    const link = document.createElement('a');
    link.href = urlData.publicUrl;
    link.download = 'OPM Step 4 Annotated Bibliography.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    handleDownloadAnnotatedBibliography,
  };
}
