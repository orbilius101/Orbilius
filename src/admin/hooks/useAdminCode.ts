// src/admin/hooks/useAdminCode.js
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminCodeRows, updateAdminCodeById } from '../api/adminApi';

export function useAdminCode(showAlert: (message: string, title?: string) => void) {
  const [adminCode, setAdminCode] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await fetchAdminCodeRows();
    if (error) {
      showAlert('Error accessing admin_code table: ' + error.message, 'Error');
      return;
    }
    if (!data || data.length === 0) {
      showAlert(
        `Admin code table query returned no rows (likely RLS). Using default fallback.`,
        'Warning'
      );
      setAdminCode('orbilius2027%*%*9');
      setNewAdminCode('orbilius2027%*%*9');
      return;
    }
    const row = data.find((r) => r.id === 1);
    if (row) {
      setAdminCode(row.code);
      setNewAdminCode(row.code);
    } else {
      showAlert('Admin code row id=1 not found in returned data.', 'Error');
      setAdminCode('NOT_FOUND');
      setNewAdminCode('NOT_FOUND');
    }
  }, [showAlert]);

  const save = useCallback(async () => {
    if (!newAdminCode.trim()) {
      showAlert('Admin code cannot be empty', 'Error');
      return;
    }
    const { data, error } = await updateAdminCodeById(1, newAdminCode.trim());
    if (error) {
      if (error.message.includes('row-level security')) {
        showAlert(
          'Cannot update admin code due to RLS. Update it directly in the Supabase dashboard.',
          'Error'
        );
      } else {
        showAlert('Error updating admin code: ' + error.message, 'Error');
      }
      return;
    }
    if (data?.length) {
      setAdminCode(newAdminCode.trim());
      setIsEditing(false);
      showAlert('Admin code updated successfully', 'Success');
      await refresh();
    } else {
      showAlert('Update may have failed (no rows affected).', 'Warning');
    }
  }, [newAdminCode, refresh, showAlert]);

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
