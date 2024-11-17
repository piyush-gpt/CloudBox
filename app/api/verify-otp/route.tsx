"use server";

import { connectToDatabase } from "@/lib/mongodb";
import OTP from "@/models/OPT"; // Import OTP model
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';
import { v4 as uuidv4 } from 'uuid';
// The handler for verifying OTP
export async function POST(req: Request) {
  try {
    const { name, email, otp: userOtp, isLogin } = await req.json(); // Get email and OTP from the request body

    if ((!isLogin && !name) || !email || !userOtp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP is required" }),
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the latest OTP for the given email (sorted by creation date)
    const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOtp) {
      return new Response(
        JSON.stringify({ error: "No OTP found in this email, resend the OTP" }),
        { status: 404 }
      );
    }

    // Check if the OTP is valid
    const isOtpValid = latestOtp.otp === userOtp;

    if (!isOtpValid) {
      return new Response(JSON.stringify({ error: "Invalid OTP" }), {
        status: 400,
      });
    }

    if (!isLogin) {
      await User.create({
        name,
        email,
        avatar:
          "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
        files: [],
      });
    } 

      const user=await User.findOne({email});
      if (!user) return;
      const payload = { email: user.email, userId: user._id ,name:user.name,jti: uuidv4().slice(0, 6) };
      const jwtSecret = process.env.JWT_SECRET_KEY;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      // Sign the JWT (using a secret key, ideally store it in environment variables)
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

      // Set the token in a cookie
      const cookieOptions = {
        httpOnly: true, // Prevents client-side access
        maxAge: 60 * 60, // 1 hour expiry
        path: "/", // Available throughout the app
      };

      const cookies = serialize("authToken", token, cookieOptions);

      // Set the cookie in the response header
      return new Response(
        JSON.stringify({ message: isLogin?"Logged In successfully":"Signed Up Successfully" }),
        {
          status: 200,
          headers: {
            "Set-Cookie": cookies,
            "Access-Control-Allow-Origin":  "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    // OTP is valid
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return new Response(JSON.stringify({ error: "Interval Server Error" }), {
      status: 500,
    });
  }
}
