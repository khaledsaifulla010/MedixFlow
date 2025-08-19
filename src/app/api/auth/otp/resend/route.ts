import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addMinutes, generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/services/otpServices";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ message: "Email required" }, { status: 400 });

    // If user already exists, they are verified
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Already verified" },
        { status: 200 }
      );
    }

    // Must be in pending table
    const pending = await prisma.patientSignup.findUnique({ where: { email } });
    if (!pending) {
      return NextResponse.json(
        { message: "No pending signup found. Please register again." },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    const expires = addMinutes(new Date(), 5);

    await prisma.patientSignup.update({
      where: { email },
      data: { otpCode: otp, otpExpiresAt: expires },
    });

    await sendOtpEmail({ to: email, name: pending.name, otp });

    return NextResponse.json({ message: "OTP resent", expiresInMinutes: 5 });
  } catch (e) {
    console.error("OTP resend error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
