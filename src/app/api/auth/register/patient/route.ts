import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { addMinutes, generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/services/otpServices";

export async function POST(req: Request) {
  try {
    const { name, email, phone, dob, password } = await req.json();

    if (!name || !email || !phone || !dob || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
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

    const existingPending = await prisma.patientSignup.findUnique({
      where: { email },
    });
    if (existingPending) {
      return NextResponse.json(
        {
          message: "Pending verification exists. Please verify or resend OTP.",
        },
        { status: 400 }
      );
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date of birth" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUND) || 10
    );
    const otp = generateOtp();
    const expires = addMinutes(new Date(), 5);
    await prisma.patientSignup.create({
      data: {
        name,
        email,
        phone,
        dob: dobDate,
        passwordHash,
        otpCode: otp,
        otpExpiresAt: expires,
      },
    });

    await sendOtpEmail({ to: email, name, otp });

    return NextResponse.json({
      message: "Registration started. OTP sent to email.",
      email,
      name,
      expiresInMinutes: 5,
    });
  } catch (e) {
    console.error("Patient registration error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
