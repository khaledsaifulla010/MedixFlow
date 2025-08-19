
export function getRescheduleAppointmentEmail(
  doctorName: string,
  doctorDegree: string,
  doctorSpecialty: string,
  patientName: string,
  newStartTime: Date,
  prevStartTime?: Date
) {
  const newTimeString = newStartTime.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const prevTimeString = prevStartTime
    ? prevStartTime.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  const subject = "Your Appointment Has Been Rescheduled";

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>
        This is to let you know that your appointment with 
        <strong>Dr. ${doctorName}</strong>, <strong>${doctorDegree}</strong>, specialist in 
        <strong>${doctorSpecialty}</strong>, has been <strong>rescheduled</strong>.
      </p>
      ${
        prevTimeString
          ? `<p><strong>Previous Time:</strong> ${prevTimeString}</p>`
          : ""
      }
      <p><strong>New Appointment Time:</strong> <strong>${newTimeString}</strong></p>
      <p>Please review the new time and plan to join a few minutes early.</p>
      <p>Thank you!</p>
      <p>Warm regards,<br/><strong>MedixFlow Healthcare Team</strong></p>
    </div>
  `;

  const textMessage = `Dear ${patientName},

Your appointment with Dr. ${doctorName}, ${doctorDegree}, specialist in ${doctorSpecialty}, has been rescheduled.
${
  prevTimeString
    ? `Previous Time: ${prevTimeString}
`
    : ""
}New Appointment Time: ${newTimeString}

Please review the new time and plan to join a few minutes early.

Thank you,
MedixFlow Healthcare Team`;

  return { subject, htmlMessage, textMessage };
}
