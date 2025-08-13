import { NextRequest, NextResponse } from "next/server";
import { generatePatientId } from "@/lib/generatePatientId";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId") as string;
    const allergies = formData.get("allergies") as string;
    const pastTreatments = formData.get("pastTreatments") as string;

    // Handle file uploads
    const files = formData.getAll("files") as File[];
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileUrls: string[] = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      fileUrls.push(`/uploads/${filename}`);
    }

    // Ensure patient profile exists
    let profile = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.patientProfile.create({
        data: {
          patientId: await generatePatientId(),
          userId,
        },
      });
    }

    // Create medical history
    const history = await prisma.medicalHistory.create({
      data: {
        patientId: profile.patientId,
        allergies,
        pastTreatments,
        files: fileUrls,
      },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Error creating medical history:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    // Get userId from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Find patient profile
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Get all medical histories for this patient
    const histories = await prisma.medicalHistory.findMany({
      where: { patientId: profile.patientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: histories });
  } catch (error) {
    console.error("Error fetching medical history:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}