import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { isValidEmail, sanitizeText, isValidTechStack } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitizeText(body.name, 80);
    const email = sanitizeText(body.email, 200).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const techStacks = Array.isArray(body.techStacks)
      ? body.techStacks.filter(isValidTechStack)
      : [];

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, techStacks });

    const token = signToken({ userId: user._id.toString(), name: user.name, email: user.email });

    const res = NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, techStacks: user.techStacks },
    });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
