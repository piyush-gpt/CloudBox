"use server";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OPT";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

// Utility to send email (OTP)
const sendOTPEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for registration",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to email successfully.");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

// The handler for registration logic
export async function POST(req: Request) {
  try {
    const { email, isLogin } = await req.json(); // Parse the JSON from the request

    // Connect to the database
    await connectToDatabase();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!isLogin) {
        return new Response(
          JSON.stringify({ error: "User with this email already exists." }),
          { status: 400 }
        );
      }
    }

    if (!existingUser && isLogin) {
      return new Response(
        JSON.stringify({ error: "User need to Sign Up first" }),
        { status: 400 }
      );
    }
    // Generate OTP and send it to the email
    const otp = uuidv4().slice(0, 6); // Generate a 6-character OTP
    await sendOTPEmail(email, otp);

    // Save OTP to database
     await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() }, // Update OTP and reset creation time
      { upsert: true, new: true } // Create if doesn't exist
    );

    return new Response(JSON.stringify({ message: "OTP sent to email", otp }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}
