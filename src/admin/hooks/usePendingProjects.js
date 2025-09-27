// src/admin/hooks/usePendingProjects.js
import { useCallback, useEffect, useState } from "react";
import {
  fetchPendingProjects,
  fetchStep5Submission,
  setProjectApproval,
  revertStep5,
} from "../api/adminApi";

export function usePendingProjects() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [comments, setComments] = useState("");
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await fetchPendingProjects();
    if (!error) setProjects(data || []);
  }, []);

  const view = useCallback(async (project) => {
    setSelected(project);
    const { data, error } = await fetchStep5Submission(project.project_id);
    if (!error) setSubmission(data || null);
  }, []);

  const clearModal = useCallback(() => {
    setSelected(null);
    setSubmission(null);
    setComments("");
  }, []);

  const certify = useCallback(
    async (approved) => {
      if (!selected) return;
      setUpdating(true);
      const { error: pErr } = await setProjectApproval(
        selected.project_id,
        approved,
        comments
      );
      if (pErr) {
        alert("Error updating project: " + pErr.message);
        setUpdating(false);
        return;
      }

      if (!approved) {
        await revertStep5(selected.project_id, comments);
      }

      alert(
        approved
          ? "Project certified successfully!"
          : "Project sent back for revision"
      );
      clearModal();
      setUpdating(false);
      refresh();
    },
    [selected, comments, clearModal, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    projects,
    selected,
    submission,
    comments,
    setComments,
    updating,
    refresh,
    view,
    clearModal,
    certify,
  };
}
