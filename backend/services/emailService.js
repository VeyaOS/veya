const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'veya.merchant@gmail.com';
const FROM_NAME = 'Veya';

async function sendVerificationEmail(email, verifyUrl) {
  try {
    const data = await brevo.transactionalEmails.sendTransacEmail({
      subject: 'Verify your Veya account',
      to: [{ email, name: email.split('@')[0] }],
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Veya Account</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; font-style: italic; color: #1a1814; margin-bottom: 24px; }
            .logo span { color: #f5a623; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1814; margin: 0 0 12px 0; }
            p { color: #5a5750; line-height: 1.6; margin: 0 0 24px 0; }
            .button { display: inline-block; background: #f5a623; color: #1a1814; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin: 8px 0 24px; }
            .button:hover { background: #e8931a; }
            .small { font-size: 12px; color: #9e9b94; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2ddd4; }
            .code { font-family: monospace; background: #f5f2eb; padding: 4px 8px; border-radius: 4px; font-size: 14px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">V<span>eya</span></div>
              <h1>Verify your email address</h1>
              <p>Thanks for signing up for Veya! Click the button below to verify your email and start accepting USDT payments.</p>
              <a href="${verifyUrl}" class="button">Verify Email →</a>
              <p>Or copy and paste this link into your browser:</p>
              <p class="code">${verifyUrl}</p>
              <p class="small">This link expires in 15 minutes. If you didn't create a Veya account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log(`✅ Verification email sent to ${email}`);
    return { success: true, data };
  } catch (error) {
    console.error('Brevo error:', error.message || error);
    return { success: false, error };
  }
}

async function sendPasswordResetEmail(email, resetUrl) {
  try {
    const data = await brevo.transactionalEmails.sendTransacEmail({
      subject: 'Reset your Veya password',
      to: [{ email, name: email.split('@')[0] }],
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Veya Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; font-style: italic; color: #1a1814; margin-bottom: 24px; }
            .logo span { color: #f5a623; }
            h1 { font-size: 24px; font-weight: 600; color: #1a1814; margin: 0 0 12px 0; }
            p { color: #5a5750; line-height: 1.6; margin: 0 0 24px 0; }
            .button { display: inline-block; background: #f5a623; color: #1a1814; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin: 8px 0 24px; }
            .small { font-size: 12px; color: #9e9b94; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2ddd4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">V<span>eya</span></div>
              <h1>Reset your password</h1>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>
              <a href="${resetUrl}" class="button">Reset Password →</a>
              <p class="small">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, data };
  } catch (error) {
    console.error('Brevo error:', error.message || error);
    return { success: false, error };
  }
}

module.exports = { 
  sendVerificationEmail, 
  sendPasswordResetEmail
};
