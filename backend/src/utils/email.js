const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const projectAssignedTemplate = ({ userName, projectName, assignedByName, loginUrl }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0f1e; color:#e5e7eb;">
  <div style="background: linear-gradient(90deg,#0f172a,#1e293b); padding: 24px; text-align:center; border-bottom: 3px solid #d4af37;">
    <h1 style="color:#d4af37; margin:0; font-size:22px;">CyphLab</h1>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color:#ffffff;">You've been assigned to a new project! 🎉</h2>
    <p>Hi ${userName},</p>
    <p>You have been added to the project <strong style="color:#d4af37;">${projectName}</strong> by <strong>${assignedByName}</strong>.</p>
    <p>You can now log in to the CyphLab Task Management platform to view your tasks.</p>
    <div style="text-align:center; margin: 32px 0;">
      <a href="${loginUrl}" style="background:#2563eb; color:#fff; padding: 12px 28px; border-radius: 8px; text-decoration:none; font-weight:bold;">View My Project</a>
    </div>
    <p style="color:#94a3b8; font-size: 13px;">If the button doesn't work, copy this link: ${loginUrl}</p>
  </div>
</div>
`;

const sendProjectAssignedEmail = async ({ toEmail, userName, projectName, assignedByName }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `You've been assigned to ${projectName}`,
      html: projectAssignedTemplate({
        userName,
        projectName,
        assignedByName,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      }),
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};


const userApprovedTemplate = ({ userName, loginUrl }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0f1e; color:#e5e7eb;">
  <div style="background: linear-gradient(90deg,#0f172a,#1e293b); padding: 24px; text-align:center; border-bottom: 3px solid #10b981;">
    <h1 style="color:#10b981; margin:0; font-size:22px;">CyphLab</h1>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color:#ffffff;">Account Approved! ✅</h2>
    <p>Hi ${userName},</p>
    <p>Great news! Your account has been approved by the Administrator.</p>
    <p>You can now log in to the CyphLab Task Management platform.</p>
    <div style="text-align:center; margin: 32px 0;">
      <a href="${loginUrl}" style="background:#10b981; color:#fff; padding: 12px 28px; border-radius: 8px; text-decoration:none; font-weight:bold;">Log In Now</a>
    </div>
  </div>
</div>
`;

const sendUserApprovedEmail = async ({ toEmail, userName }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM , 
      to: toEmail,
      subject: `Your protrack Account is Approved!`,
      html: userApprovedTemplate({
        userName,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      }),
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = { sendProjectAssignedEmail, sendUserApprovedEmail };