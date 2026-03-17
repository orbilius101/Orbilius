export function useStep2IndexHandlers({ getDesignBriefUrl, getDesignBriefInstructionsUrl }: any) {
  const handleDownloadDesignBrief = async () => {
    const url = await getDesignBriefUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'OPM Project Design Brief.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInstructions = async () => {
    const url = await getDesignBriefInstructionsUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
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
