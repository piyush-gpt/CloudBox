import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the OTP document
interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

// Create the OTP schema with TypeScript types
const otpSchema: Schema<IOTP> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Document will expire 5 minutes after creation
    },
  },
  
);

// Define the OTP model with the IOTP interface
const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;
