const emailTemplate = (codeOrLink, name, subject) => {
  const isLink = codeOrLink.startsWith("http");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
      .container { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #0e4868ff, #0e4868ff); padding: 30px 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
      .header p { margin: 5px 0 0; font-size: 13px; opacity: 0.9; }
      .content { padding: 30px; color: #334155; line-height: 1.6; }
      .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
      .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 25px 0; }
      .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0e4868ff; margin: 0; }
      .btn { display: inline-block; background-color: #0e4868ff; color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>PhysioProgress</h1>
        <p>Rehabilitation Management Platform</p>
      </div>
      <div class="content">
        <div class="greeting">Hello ${name},</div>
        <p>Thank you for using PhysioProgress. Please use the verification code below for <strong>${subject}</strong>:</p>
        
        ${
          isLink
            ? `<div style="text-align: center;"><a href="${codeOrLink}" class="btn">Reset Password</a></div>`
            : `<div class="otp-box"><h2 class="otp-code">${codeOrLink}</h2></div>`
        }
        
        <p style="font-size: 13px; color: #64748b;">This code is valid for 10 minutes. If you did not request this, please disregard this email.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} PhysioProgress System. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = emailTemplate;