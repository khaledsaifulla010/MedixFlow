import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  ["accessToken", "refreshToken", "role"].forEach((cookieName) => {
    response.cookies.set({
      name: cookieName,
      value: "",
      path: "/",
      expires: new Date(0),
      httpOnly: cookieName !== "role",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  return response;
}
