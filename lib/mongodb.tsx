"use server";

import mongoose from 'mongoose';

// Type annotation for the connection status
let isConnected: boolean = false; // Global variable to track the connection status

export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    console.log("Already connected to MongoDB.");
    return;
  }

  try {
    // Ensure MONGODB_URI is defined and typed
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }

    // Attempt to connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    isConnected = true;
    console.log("Connected to MongoDB successfully.");

    // Optional: Handle disconnection and reconnecting
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log("MongoDB disconnected. Attempting to reconnect...");
      connectToDatabase();
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("MongoDB connection failed. Please try again later.");
  }
}
