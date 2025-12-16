import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role, signupUrl } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Orbilius <onboarding@resend.dev>',
      to: email,
      subject: `You're invited to join Orbilius as a ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Welcome to Orbilius!</h2>
          <p>You've been invited to join Orbilius as a <strong>${role}</strong>.</p>
          <p>Click the button below to create your account:</p>
          <a href="${signupUrl}" 
             style="display: inline-block; background-color: #1976d2; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                    margin: 16px 0;">
            Create Account
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${signupUrl}">${signupUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Send invite error:', error);
    return res.status(500).json({ error: 'Failed to send invitation email' });
  }
}
