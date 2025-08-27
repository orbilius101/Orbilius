// src/admin/components/AdminHeader.jsx
import React from "react";
import { styles as s } from "../styles/adminStyles";
import { signOut } from "../api/adminApi";

export default function AdminHeader({ onSignOut }) {
  const handleSignOut = async () => {
    await signOut();
    onSignOut?.();
  };
  return (
    <div
      style={{
        ...s.card,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      <h1 style={{ margin: 0, color: "#333" }}>Orbilius Admin Dashboard</h1>
      <button
        onClick={handleSignOut}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
