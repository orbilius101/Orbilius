// src/admin/hooks/useAdminCode.js
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminCodeRows, updateAdminCodeById } from '../api/adminApi';

export function useAdminCode() {
  const [adminCode, setAdminCode] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await fetchAdminCodeRows();
    if (error) {
      alert('Error accessing admin_code table: ' + error.message);
      return;
    }
    if (!data || data.length === 0) {
      alert(`Admin code table query returned no rows (likely RLS). Using default fallback.`);
      setAdminCode('orbilius2027%*%*9');
      setNewAdminCode('orbilius2027%*%*9');
      return;
    }
    const row = data.find((r) => r.id === 1);
    if (row) {
      setAdminCode(row.orbilius_admin_code);
      setNewAdminCode(row.orbilius_admin_code);
    } else {
      alert('Admin code row id=1 not found in returned data.');
      setAdminCode('NOT_FOUND');
      setNewAdminCode('NOT_FOUND');
    }
  }, []);

  const save = useCallback(async () => {
    if (!newAdminCode.trim()) {
      alert('Admin code cannot be empty');
      return;
    }
    const { data, error } = await updateAdminCodeById(1, newAdminCode.trim());
    if (error) {
      if (error.message.includes('row-level security')) {
        alert('Cannot update admin code due to RLS. Update it directly in the Supabase dashboard.');
      } else {
        alert('Error updating admin code: ' + error.message);
      }
      return;
    }
    if (data?.length) {
      setAdminCode(newAdminCode.trim());
      setIsEditing(false);
      alert('Admin code updated successfully');
      await refresh();
    } else {
      alert('Update may have failed (no rows affected).');
    }
  }, [newAdminCode, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    adminCode,
    newAdminCode,
    setNewAdminCode,
    isEditing,
    setIsEditing,
    refresh,
    save,
  };
}
