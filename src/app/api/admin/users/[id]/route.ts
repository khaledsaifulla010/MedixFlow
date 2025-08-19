import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "User id is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        doctorProfile: { select: { id: true } },
        patientProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (user.doctorProfile) {
        const doctorId = user.doctorProfile.id;

        const doctorAppts = await tx.appointment.findMany({
          where: { doctorId },
          select: { id: true },
        });
        const doctorApptIds = doctorAppts.map((a) => a.id);

        if (doctorApptIds.length > 0) {
          await tx.prescriptionItem.deleteMany({
            where: { prescription: { appointmentId: { in: doctorApptIds } } },
          });
          await tx.prescription.deleteMany({
            where: { appointmentId: { in: doctorApptIds } },
          });
          await tx.appointment.deleteMany({
            where: { id: { in: doctorApptIds } },
          });
        }
        await tx.doctorAvailability.deleteMany({ where: { doctorId } });
        await tx.doctorProfile.delete({ where: { id: doctorId } });
      }

      if (user.patientProfile) {
        const patientId = user.patientProfile.id;

        const patientAppts = await tx.appointment.findMany({
          where: { patientId },
          select: { id: true },
        });
        const patientApptIds = patientAppts.map((a) => a.id);

        if (patientApptIds.length > 0) {
          await tx.prescriptionItem.deleteMany({
            where: { prescription: { appointmentId: { in: patientApptIds } } },
          });
          await tx.prescription.deleteMany({
            where: { appointmentId: { in: patientApptIds } },
          });
          await tx.appointment.deleteMany({
            where: { id: { in: patientApptIds } },
          });
        }
        await tx.medicalHistory.deleteMany({
          where: { patientProfileId: patientId },
        });
        await tx.patientProfile.delete({ where: { id: patientId } });
      }

      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
