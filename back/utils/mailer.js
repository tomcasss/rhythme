import nodemailer from 'nodemailer';

const EMAIL_ENABLED = String(process.env.EMAIL_ENABLED).toLowerCase() === 'true';

let etherealAccountPromise = null;
let smtpTransporter = null;

async function getEtherealTransporter() {
  if (!etherealAccountPromise) {
    etherealAccountPromise = nodemailer.createTestAccount();
  }
  const account = await etherealAccountPromise;
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: account.user, pass: account.pass },
  });
}

async function getTransporter() {
  const provider = (process.env.EMAIL_PROVIDER || 'ethereal').toLowerCase();
  if (provider === 'ethereal') {
    return getEtherealTransporter();
  }
  // Fallback SMTP genérico si algún día cambias a otro proveedor:
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return smtpTransporter;
}

export async function sendMail({ to, subject, html, text }) {
  if (!EMAIL_ENABLED) return { skipped: true };
  const transporter = await getTransporter();
  const from = process.env.MAIL_FROM || 'no-reply@rhythme.test';
  const info = await transporter.sendMail({ from, to, subject, html, text });
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log('Ethereal preview URL:', preview);
  return { info, preview };
}