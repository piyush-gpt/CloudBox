// models/Files.ts
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import User from './User';
import { IUser } from './User';
// Define an interface for the Files document
type FileType = 'document' | 'image' | 'video' | 'audio' | 'other';

export interface IFiles extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; // Reference to User model
  url: string; // File name or file path
  type: FileType; // Type of file, restricted to specific values
  extension: string; // File extension (e.g., .pdf, .jpg)
  publicId:string,
  accountId:mongoose.Types.ObjectId | IUser;
  ownerId:mongoose.Types.ObjectId | IUser;
  size: number; // Size of the file in bytes
  users: string[];
  createdAt?: Date; // Automatically added by Mongoose timestamps
  updatedAt: Date; // Array of user IDs (strings) that have access to the file
}

// Define the schema with TypeScript types
const filesSchema = new Schema<IFiles>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['document', 'image', 'video', 'audio', 'other'], required: true },
  extension: { type: String },
  publicId:{type:String},
  accountId:{ type: mongoose.Schema.Types.ObjectId, ref: User.modelName},
  ownerId:{ type: mongoose.Schema.Types.ObjectId, ref: User.modelName},
  size: { type: Number },
  users: { type: [String]} // Array of user emails who have access to the file
},
{ timestamps: true } // Enable automatic timestamps
);

// Export the Files model, typed with IFiles interface
const Files :  Model<IFiles> =mongoose.models.Files || mongoose.model<IFiles>('Files', filesSchema);

export default Files;
