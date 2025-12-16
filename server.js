// Local Express server for API route testing (mimics Vercel serverless function)
// Usage: node server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/checkUserEmail', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
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
  if (userError) return res.status(500).json({ error: 'Error checking users table' });
  if (userData) return res.status(200).json({ exists: true });
  // Check auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ email });
  if (authError) return res.status(500).json({ error: 'Error checking auth.users' });
  if (authData && authData.users && authData.users.length > 0)
    return res.status(200).json({ exists: true });
  return res.status(200).json({ exists: false });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
