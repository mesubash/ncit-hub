import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface OTPEmailOptions extends EmailOptions {
  otp: string;
  userName?: string;
}

export interface PasswordResetEmailOptions extends EmailOptions {
  resetLink: string;
  userName?: string;
}

/**
 * Send a generic email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@ncithub.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    } as any);

    if (response.error) {
      console.error("Error sending email:", response.error);
      return false;
    }

    console.log("Email sent successfully:", response.data?.id);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(
  options: OTPEmailOptions
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .greeting {
            margin-bottom: 20px;
            font-size: 16px;
          }
          .otp-container {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #000;
            font-family: 'Courier New', monospace;
          }
          .expiry-info {
            color: #666;
            font-size: 14px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NCIT Hub</div>
            <p>Email Verification</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              ${options.userName ? `Hi ${options.userName},` : "Hello,"}
            </div>
            
            <p>Thank you for signing up with NCIT Hub. To complete your email verification, please use the following code:</p>
            
            <div class="otp-container">
              <div class="otp-code">${options.otp}</div>
            </div>
            
            <p>Enter this code in the verification form to continue.</p>
            
            <div class="expiry-info">
              This code will expire in 10 minutes.
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> Do not share this code with anyone. NCIT Hub support staff will never ask for this code.
            </div>
            
            <p>If you did not request this code, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 NCIT Hub. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: options.to,
    subject: options.subject || "Email Verification Code",
    html: htmlContent,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  options: PasswordResetEmailOptions
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .greeting {
            margin-bottom: 20px;
            font-size: 16px;
          }
          .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            margin: 30px 0;
            text-align: center;
            font-weight: 600;
          }
          .cta-button:hover {
            background-color: #2563eb;
          }
          .expiry-info {
            color: #666;
            font-size: 14px;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .warning {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #7f1d1d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NCIT Hub</div>
            <p>Password Reset Request</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              ${options.userName ? `Hi ${options.userName},` : "Hello,"}
            </div>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${options.resetLink}" class="cta-button">Reset Password</a>
            </div>
            
            <p>Or copy this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
              ${options.resetLink}
            </p>
            
            <div class="expiry-info">
              This link will expire in 24 hours.
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>For security, we never send passwords via email. You will create a new password after clicking the link above.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 NCIT Hub. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: options.to,
    subject: options.subject || "Reset Your Password",
    html: htmlContent,
  });
}

/**
 * Send account created email
 */
export async function sendAccountCreatedEmail(
  email: string,
  userName?: string
): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .content {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NCIT Hub</div>
            <p>Welcome!</p>
          </div>
          
          <div class="content">
            <p>${userName ? `Welcome to NCIT Hub, ${userName}!` : "Welcome to NCIT Hub!"}</p>
            
            <p>Your account has been successfully created. You can now access all features of NCIT Hub including:</p>
            
            <ul>
              <li>📚 Read and write blog posts</li>
              <li>📅 Explore and register for events</li>
              <li>💬 Engage with community through comments</li>
              <li>🔖 Bookmark your favorite posts</li>
              <li>🔔 Stay updated with notifications</li>
            </ul>
            
            <p>Get started by exploring the content or creating your first blog post!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 NCIT Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to NCIT Hub!",
    html: htmlContent,
  });
}
