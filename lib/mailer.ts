import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.CRM_URL ?? 'https://www.ducks.co.il'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`
  await transporter.sendMail({
    from: `"CRM" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })
}
