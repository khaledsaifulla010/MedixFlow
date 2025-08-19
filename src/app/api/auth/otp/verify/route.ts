import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and code are required" },
        { status: 400 }
      );
    }

    // Check pending signup
    const pending = await prisma.patientSignup.findUnique({ where: { email } });
    if (!pending) {
      // Maybe user already verified?
      const alreadyUser = await prisma.user.findUnique({ where: { email } });
      if (alreadyUser) {
        return NextResponse.json(
          { message: "Already verified" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: "No pending signup found. Please register again." },
        { status: 404 }
      );
    }

    // Validate OTP
    if (!pending.otpCode || !pending.otpExpiresAt) {
      return NextResponse.json(
        { message: "OTP not found, please resend" },
        { status: 400 }
      );
    }
    if (new Date() > pending.otpExpiresAt) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }
    if (String(code) !== pending.otpCode) {
      return NextResponse.json({ message: "Wrong code" }, { status: 400 });
    }

    // Create real user + patient profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          phone: pending.phone,
          dob: pending.dob,
          role: "patient",
          password: pending.passwordHash,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      await tx.patientProfile.create({
        data: { userId: user.id /* no OTP fields here anymore */ },
      });

      // cleanup pending
      await tx.patientSignup.delete({ where: { email: pending.email } });

      return user;
    });

    // Issue tokens now that user exists
    const accessToken = jwt.sign(
      { id: result.id, role: result.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: result.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Verification successful",
      user: result,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.error("OTP verify error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
