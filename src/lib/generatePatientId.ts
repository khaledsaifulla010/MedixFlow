import { prisma } from "@/lib/prisma";

export async function generatePatientId() {
  const lastProfile = await prisma.patientProfile.findFirst({
    orderBy: { createdAt: "desc" },
  });

  let lastNumber = 0;
  if (lastProfile) {
    const match = lastProfile.patientId.match(/PAT-(\d+)/);
    if (match) {
      lastNumber = parseInt(match[1], 10);
    }
  }

  return `PAT-${String(lastNumber + 1).padStart(4, "0")}`;
}
