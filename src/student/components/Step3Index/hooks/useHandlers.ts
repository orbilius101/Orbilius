export function useStep3IndexHandlers({ getPlanningDocsUrl }: any) {
  const handleDownloadPlanningDocs = () => {
    const urlData = getPlanningDocsUrl();
    const link = document.createElement('a');
    link.href = urlData.publicUrl;
    link.download = 'OPM Step 3 Work Breakdown Structure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    handleDownloadPlanningDocs,
  };
}
