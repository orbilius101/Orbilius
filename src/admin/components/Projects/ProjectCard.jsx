// src/admin/components/Projects/ProjectCard.jsx
import React from "react";

export default function ProjectCard({ project, onReview }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1.5rem",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
        {project.project_title}
      </h3>
      <p style={{ margin: "0.5rem 0", color: "#555" }}>
        Student: {project.users.first_name} {project.users.last_name} (
        {project.users.email})
      </p>
      <p style={{ margin: "0.5rem 0", color: "#666", fontSize: "0.9rem" }}>
        Created: {new Date(project.created_at).toLocaleDateString()}
      </p>
      <button
        onClick={() => onReview(project)}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: "1rem",
          marginTop: "1rem",
        }}
      >
        Review Final Submission
      </button>
    </div>
  );
}
