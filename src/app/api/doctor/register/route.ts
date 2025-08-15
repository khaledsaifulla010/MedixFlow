// app/api/register-doctor/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      dob,
      role,
      password,
      speciality,
      degree,
      availabilities,
    } = await req.json();

    if (
      !name ||
      !email ||
      !phone ||
      !dob ||
      !role ||
      !password ||
      !speciality ||
      !degree ||
      !availabilities ||
      !Array.isArray(availabilities) ||
      availabilities.length === 0
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (role !== "doctor") {
      return NextResponse.json(
        { message: "Role must be doctor" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUND || 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date of birth" },
        { status: 400 }
      );
    }

    const formattedAvailabilities = availabilities.map((slot: any) => {
      if (
        typeof slot.isRecurring !== "boolean" ||
        (!slot.isRecurring && !slot.date) ||
        (slot.isRecurring && typeof slot.dayOfWeek !== "number")
      ) {
        throw new Error("Invalid availability slot");
      }

      return {
        isRecurring: slot.isRecurring,
        dayOfWeek: slot.isRecurring ? slot.dayOfWeek : null,
        date: slot.isRecurring
          ? "1970-01-01" // placeholder for recurring slots
          : new Date(slot.date).toISOString().split("T")[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
    });

    const doctor = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        dob: dobDate,
        role,
        password: hashedPassword,
        doctorProfile: {
          create: {
            speciality,
            degree,
            availabilities: {
              create: formattedAvailabilities,
            },
          },
        },
      },
      include: {
        doctorProfile: { include: { availabilities: true } },
      },
    });

    const accessToken = jwt.sign(
      { id: doctor.id, role: doctor.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: doctor.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      user: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        speciality: doctor.doctorProfile!.speciality,
        degree: doctor.doctorProfile!.degree,
        availabilities: doctor.doctorProfile!.availabilities,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("Doctor registration error:", error);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
