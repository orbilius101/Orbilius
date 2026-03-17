export function useStep3IndexHandlers({ getPlanningDocsUrl }: any) {
  const handleDownloadPlanningDocs = async () => {
    const url = await getPlanningDocsUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'OPM Step 3 Work Breakdown Structure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    handleDownloadPlanningDocs,
  };
}
