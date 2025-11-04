export function useStep2IndexHandlers({ getDesignBriefUrl, getDesignBriefInstructionsUrl }: any) {
  const handleDownloadDesignBrief = () => {
    const urlData = getDesignBriefUrl();
    const link = document.createElement('a');
    link.href = urlData.publicUrl;
    link.download = 'OPM Project Design Brief.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInstructions = () => {
    const urlData = getDesignBriefInstructionsUrl();
    const link = document.createElement('a');
    link.href = urlData.publicUrl;
    link.download = 'Design Brief Instructions.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    handleDownloadDesignBrief,
    handleDownloadInstructions,
  };
}
