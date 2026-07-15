export interface ResetPasswordEmailProps {
  firstName: string;
  resetToken: string;
  expiresInHours: number;
}

export function buildResetPasswordHtml(props: ResetPasswordEmailProps): { subject: string; html: string } {
  const { firstName, resetToken, expiresInHours } = props;
  const appName = 'Zyntr';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reset your ${appName} password</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0C12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0C12;padding:40px 16px">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%">
<tr><td style="background-color:#12161D;border-radius:16px;padding:40px 32px;text-align:center">
<h1 style="color:#FFFFFF;font-size:24px;font-weight:600;margin:0 0 8px">Reset your password</h1>
<p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.5;margin:0 0 24px">Hi ${firstName}, use the code below to reset your ${appName} password. This code expires in ${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}.</p>
<div style="background-color:#1A1F2B;border-radius:12px;padding:20px;margin:0 0 24px">
<code style="color:#FF6B4A;font-size:28px;font-weight:600;letter-spacing:4px;word-break:break-all">${resetToken}</code>
</div>
<p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.5;margin:0">If you didn't request a password reset, you can safely ignore this email.</p>
</td></tr>
<tr><td style="padding:24px 32px 0;text-align:center">
<p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">${appName} &mdash; Discover events. Book experiences. Make memories.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return {
    subject: `Reset your ${appName} password`,
    html,
  };
}
