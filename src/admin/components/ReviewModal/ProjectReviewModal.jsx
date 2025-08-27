// src/admin/components/ReviewModal/ProjectReviewModal.jsx
import React from "react";
import { downloadProjectFile } from "../../api/adminApi";

export default function ProjectReviewModal({
  project,
  submission,
  comments,
  setComments,
  onClose,
  onCertify,
  updating,
}) {
  if (!project) return null;

  const dl = async () => {
    if (!submission?.file_path) return;
    const { data, error } = await downloadProjectFile(submission.file_path);
    if (error) {
      alert("Error downloading file: " + error.message);
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = submission.file_path.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          maxWidth: 800,
          maxHeight: "90vh",
          width: "90%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>
            Reviewing: {project.project_title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "2rem",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: 6,
              marginBottom: "1.5rem",
            }}
          >
            <p>
              <strong>Student:</strong> {project.users.first_name}{" "}
              {project.users.last_name}
            </p>
            <p>
              <strong>Email:</strong> {project.users.email}
            </p>
            <p>
              <strong>Project Created:</strong>{" "}
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {submission && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#333" }}>
                Step 5 Final Submission
              </h3>

              {submission.file_path && (
                <div style={{ marginBottom: "1rem" }}>
                  <p>
                    <strong>Submitted File:</strong>
                  </p>
                  <button
                    onClick={dl}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Download Submission
                  </button>
                </div>
              )}

              {submission.youtube_link && (
                <div style={{ marginBottom: "1rem" }}>
                  <p>
                    <strong>YouTube Video:</strong>
                  </p>
                  <a
                    href={submission.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007bff",
                      textDecoration: "none",
                      wordBreak: "break-all",
                    }}
                  >
                    {submission.youtube_link}
                  </a>
                </div>
              )}

              {submission.teacher_comments && (
                <div
                  style={{
                    backgroundColor: "#e9ecef",
                    padding: "1rem",
                    borderRadius: 6,
                    marginBottom: "1rem",
                  }}
                >
                  <p>
                    <strong>Teacher Comments:</strong>
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", fontStyle: "italic" }}>
                    {submission.teacher_comments}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: "bold", color: "#555" }}>
              Orbilius Comments (optional):
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments for the student and teacher..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: "1rem",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              onClick={() => onCertify(false)}
              disabled={updating}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: updating ? "#ccc" : "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: updating ? "not-allowed" : "pointer",
                fontSize: "1rem",
              }}
            >
              {updating ? "Processing..." : "Send Back for Revision"}
            </button>
            <button
              onClick={() => onCertify(true)}
              disabled={updating}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: updating ? "#ccc" : "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: updating ? "not-allowed" : "pointer",
                fontSize: "1rem",
              }}
            >
              {updating ? "Processing..." : "Certify Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
