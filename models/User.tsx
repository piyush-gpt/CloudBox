// models/User.ts
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Define an interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  avatar:string,
}

// Define the schema with TypeScript types
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar:{ type: String },
});

// Export the User model, typed with IUser interface
const User : Model<IUser>= mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
