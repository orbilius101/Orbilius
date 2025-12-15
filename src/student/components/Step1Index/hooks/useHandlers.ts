export function useStep1IndexHandlers({ getDiscoveryLogUrl, getInstructionsUrl, showAlert }: any) {
  const handleDownloadBibliography = async () => {
    try {
      const publicUrl = getDiscoveryLogUrl();

      if (publicUrl) {
        const link = document.createElement('a');
        link.href = publicUrl;
        link.download = 'Orbilius-PM-The-Discovery-Log.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showAlert('Discovery Log template not found. Please contact your teacher.', 'Error');
      }
    } catch (error) {
      console.error('Error downloading discovery log:', error);
      showAlert('Error downloading file. Please try again.', 'Error');
    }
  };

  const handleDownloadHelpGuide = async () => {
    try {
      const publicUrl = getInstructionsUrl();

      if (publicUrl) {
        const link = document.createElement('a');
        link.href = publicUrl;
        link.download = 'Orbilius-PM-Discovery-Log-Instructions.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showAlert('Discovery Log instructions not found. Please contact your teacher.', 'Error');
      }
    } catch (error) {
      console.error('Error downloading instructions:', error);
      showAlert('Error downloading file. Please try again.', 'Error');
    }
  };

  return {
    handleDownloadBibliography,
    handleDownloadHelpGuide,
  };
}
