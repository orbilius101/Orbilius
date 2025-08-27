// src/admin/components/AdminCodeManager.jsx
import React from "react";
import { styles as s } from "../styles/adminStyles";

export default function AdminCodeManager({
  adminCode,
  newAdminCode,
  setNewAdminCode,
  isEditing,
  setIsEditing,
  onSave,
}) {
  return (
    <div style={{ ...s.card, marginBottom: "2rem" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#333" }}>
        Admin Code Management
      </h2>
      {isEditing ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={newAdminCode}
            onChange={(e) => setNewAdminCode(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: 4,
              fontSize: "1rem",
            }}
          />
          <button
            onClick={onSave}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
            }}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <code
            style={{
              background: "#f1f3f4",
              padding: "0.5rem 1rem",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: "1.1rem",
              border: "1px solid #ddd",
              color: "#333",
              fontWeight: 600,
            }}
          >
            {adminCode}
          </code>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
