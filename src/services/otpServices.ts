import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: String(process.env.EMAIL_SECURE) === "true",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendOtpEmail({
  to,
  name,
  otp,
}: {
  to: string;
  name: string;
  otp: string;
}) {
  const text = `Hello ${name},\n\nYour OTP code is : ${otp}\n\nWarm Regards,\nMedixFlow HealthCare System`;
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Your OTP Code",
    text,
  });
}
