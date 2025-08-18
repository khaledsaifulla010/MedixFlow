import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmailReminder(
  toEmail: string,
  subject: string,
  htmlMessage: string,
  textMessage?: string
) {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: toEmail,
      subject,
      html: htmlMessage,
      text: textMessage,
    });
    console.log("Email sent to:", toEmail);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export function getOnlineAppointmentReminderEmail(
  doctorName: string,
  doctorDegree: string,
  doctorSpecialty: string,
  patientName: string,
  startTime: Date
) {
  const timeString = startTime.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>
        This is a friendly reminder for your upcoming <strong>online</strong> appointment with 
        <strong>Dr. ${doctorName}</strong>, 
        <strong>${doctorDegree}</strong>, specialist in <strong>${doctorSpecialty}</strong>.
      </p>
      <p>
        <strong>Appointment Time:</strong> <strong>${timeString}</strong>
      </p>
      <p>
        Please be prepared and join the session a few minutes early to ensure a smooth start.
      </p>
      <p>Thank you, and we look forward to seeing you online!</p>
      <p>Warm regards,<br/><strong>MedixFlow Healthcare Team</strong></p>
    </div>
  `;

  const textMessage = `Dear ${patientName},

This is a friendly reminder for your upcoming online appointment with Dr. ${doctorName}, ${doctorDegree}, specialist in ${doctorSpecialty}.

Appointment Time: ${timeString}

Please be prepared and join the session a few minutes early to ensure a smooth start.

Thank you,
MedixFlow Healthcare Team`;

  return { htmlMessage, textMessage };
}
