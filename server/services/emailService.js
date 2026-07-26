import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email] Ethereal test mailer initialized: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Email] Fallback transporter creation:', err.message);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('[Email Simulation] Mail sent:', mailOptions.subject, 'to:', mailOptions.to);
          return { messageId: `mock-${Date.now()}` };
        },
      };
    }
  }

  return transporter;
};

export const sendCustomerConfirmation = async (lead) => {
  try {
    const mailer = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AI LeadDesk" <no-reply@leaddesk.com>',
      to: lead.email,
      subject: `Thank you for reaching out, ${lead.name}!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5;">We received your inquiry</h2>
          <p>Hi <strong>${lead.name}</strong>,</p>
          <p>Thank you for submitting your details to AI LeadDesk. Our team is reviewing your request and will reach out shortly.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">AI LeadDesk Mini &bull; Automated System</p>
        </div>
      `,
    };
    const info = await mailer.sendMail(mailOptions);
    if (info?.messageId && nodemailer.getTestMessageUrl) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) console.log(`[Email] Customer confirmation preview: ${testUrl}`);
    }
  } catch (error) {
    console.error('[Email Error] Failed to send customer confirmation:', error.message);
  }
};

export const sendAdminNotification = async (lead) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@leaddesk.com';
    const mailer = await getTransporter();
    const isHighPriority = lead.aiAnalysis?.priority === 'High';
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AI LeadDesk Alerts" <no-reply@leaddesk.com>',
      to: adminEmail,
      subject: `${isHighPriority ? '🔥 HIGH PRIORITY LEAD: ' : 'New Lead Alert: '}${lead.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: ${isHighPriority ? '#dc2626' : '#4f46e5'};">
            ${isHighPriority ? '🔥 High Priority Lead Received' : 'New Lead Submitted'}
          </h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Budget:</strong> ${lead.budget}</p>
          <p><strong>Source:</strong> ${lead.source || 'Website'}</p>
          <p><strong>Message:</strong> ${lead.message}</p>
          ${
            lead.aiAnalysis?.summary
              ? `<div style="background: #f8fafc; padding: 12px; border-left: 4px solid #4f46e5; margin-top: 12px; border-radius: 6px;">
                  <strong>AI Summary:</strong> ${lead.aiAnalysis.summary}
                 </div>`
              : ''
          }
        </div>
      `,
    };
    const info = await mailer.sendMail(mailOptions);
    if (info?.messageId && nodemailer.getTestMessageUrl) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) console.log(`[Email] Admin notification preview: ${testUrl}`);
    }
  } catch (error) {
    console.error('[Email Error] Failed to send admin notification:', error.message);
  }
};

export const sendAssignmentNotification = async (lead, assignee) => {
  if (!assignee || !assignee.email) return;
  try {
    const mailer = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AI LeadDesk CRM" <no-reply@leaddesk.com>',
      to: assignee.email,
      subject: `Lead Assigned: ${lead.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5;">New Lead Assigned to You</h2>
          <p>Hi <strong>${assignee.name}</strong>,</p>
          <p>You have been assigned to lead <strong>${lead.name}</strong> (${lead.email}).</p>
          <p><strong>Status:</strong> ${lead.status}</p>
          <p><strong>Budget:</strong> ${lead.budget}</p>
        </div>
      `,
    };
    const info = await mailer.sendMail(mailOptions);
    if (info?.messageId && nodemailer.getTestMessageUrl) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) console.log(`[Email] Assignment preview: ${testUrl}`);
    }
  } catch (error) {
    console.error('[Email Error] Failed to send assignment notification:', error.message);
  }
};
