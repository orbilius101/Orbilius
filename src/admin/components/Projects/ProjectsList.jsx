// src/admin/components/Projects/ProjectsList.jsx
import React from "react";
import ProjectCard from "./ProjectCard";

export default function ProjectsList({ projects, onReview }) {
  if (!projects?.length) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "#666",
          fontSize: "1.1rem",
          padding: "2rem",
        }}
      >
        No projects pending certification
      </p>
    );
  }
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {projects.map((p) => (
        <ProjectCard key={p.project_id} project={p} onReview={onReview} />
      ))}
    </div>
  );
}
