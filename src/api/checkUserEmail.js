// This API route checks if an email exists in either the users table or Supabase auth.users
// Requires SUPABASE_SERVICE_ROLE_KEY in environment variables

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (userError) {
    return res.status(500).json({ error: 'Error checking users table' });
  }
  if (userData) {
    return res.status(200).json({ exists: true });
  }

  // Check auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ email });
  if (authError) {
    return res.status(500).json({ error: 'Error checking auth.users' });
  }
  if (authData && authData.users && authData.users.length > 0) {
    return res.status(200).json({ exists: true });
  }

  return res.status(200).json({ exists: false });
}
