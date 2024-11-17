"use server";

import { revalidatePath } from "next/cache";
import cloudinary from "../../lib/cloudinary";
import { getFileType, parseStringify } from "../utils";
import Files from "@/models/Files";
import { connectToDatabase } from "../mongodb";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { cookies } from "next/headers";
export const uploadFile = async ({
  file,
  accountId,
  ownerId,
  path,
}: UploadFileProps) => {
  try {
    await connectToDatabase();

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64File = fileBuffer.toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${base64File}`,
      {
        folder: "CloudBox",
        resource_type: "auto",
      }
    );
    const fileDoc = {
      name: file.name.split(".").slice(0, -1).join("."),
      url: result.secure_url,
      publicId: result.public_id,
      type: getFileType(file.name).type,
      extension: getFileType(file.name).extension,
      size: result.bytes,
      accountId: new mongoose.Types.ObjectId(accountId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
      users: [],
    };
    await Files.create(fileDoc).catch(async (e) => {
      await cloudinary.uploader.destroy(result.public_id);
      console.error(e);
      throw new Error("Failed to create file document");
    });
    revalidatePath(path);
    return { ...fileDoc, accountId };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Upload failed");
  }
};

export const renameFile = async ({ id, name, path }: RenameFileProps) => {
  await connectToDatabase();
  try {
    const newName = name;
    const updatedFile = await Files.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (e) {
    console.error("Failed to rename file", e);
    throw new Error("failed to rename file");
  }
};

export const updateFileUsers = async ({
  id,
  emails,
  path,
}: UpdateFileUsersProps) => {
  await connectToDatabase();
  try {
    const updatedFile = await Files.findByIdAndUpdate(
      id,
      {
        $addToSet: { users: { $each: emails } }, // Add multiple unique emails
      },
      { new: true } // Return the updated document
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (e) {
    console.error("Failed to update file users", e);
    throw new Error("Failed to update file users");
  }
};
export const deleteFileUsers = async ({
  id,
  email,
  path,
}: {
  id: string;
  email: string;
  path: string;
}) => {
  await connectToDatabase();
  try {
    const updatedFile = await Files.findByIdAndUpdate(
      id,
      {
        $pull: { users: email }, // Remove the email from the users array
      },
      { new: true } // Return the updated document
    );

    if (!updatedFile) {
      throw new Error("File not found");
    }
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    console.error("Error removing user from file:", error);
    throw error;
  }
};
export const deleteFile = async ({
  id,
  public_id,
  path,
}: {
  id: string;
  public_id: string;
  path: string;
}) => {
  await connectToDatabase();
  try {
    const deletedFile = await Files.findByIdAndDelete(id);
    if (deletedFile) {
      await cloudinary.uploader.destroy(public_id);
    }
    revalidatePath(path);
  } catch (error) {
    console.error("Error removing user from file:", error);
    throw error;
  }
};
// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      throw new Error("User is not authenticated.");
    }

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as User;
    const files = await Files.find({
      $or: [
        { ownerId: decoded.userId }, // Match ownerId with token
        { users: decoded.email }, // Match users array with user email
      ],
    });

    files.forEach((file) => {
      const fileType = file.type;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;
      const updatedDate = file.updatedAt ? file.updatedAt : null;
      const latestDate =
        totalSpace[fileType].latestDate !== ""
          ? totalSpace[fileType].latestDate
          : null;

      if (!latestDate || (updatedDate && updatedDate > new Date(latestDate))) {
        totalSpace[fileType].latestDate = updatedDate?.toISOString() || "";
      }
    });
    return totalSpace;
  } catch (error) {
    console.error("Error calculating total space used:", error);
    throw error;
  }
}

export async function getTotalFileSize(token: string, type: string) {
  try {
    // Define the base match conditions
    await connectToDatabase();
    const adjustedType = type !== "media" ? type.slice(0, -1) : null;
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as User;
    const email = decoded.email;
    const baseMatch = {
      $or: [
        { ownerId: decoded.userId }, // Check ownerId matches token
        { users: email }, // Check if users array contains user.email
      ],
    };

    // Define type-specific conditions
    const typeMatch =
      type === "media"
        ? { type: { $in: ["video", "audio"] } } // If type is 'media', check for 'video' or 'audio'
        : { type: adjustedType }; // Otherwise, use the adjusted type (with last letter removed)

    // Aggregate query to calculate the total size
    // const result = await Files.aggregate([
    //     { $match: { ...baseMatch, ...typeMatch } }, // Combine baseMatch and typeMatch
    //     { $group: { _id: null, totalSize: { $sum: '$size' } } } // Sum up the sizes
    // ]);
    const matchConditions = { ...baseMatch, ...typeMatch };
    const matchedDocs = await Files.find(matchConditions).exec();

    // Step 2: Calculate the total size by summing the 'size' of the matched documents
    const totalSize = matchedDocs.reduce((acc, doc) => acc + (doc.size || 0), 0);
    return totalSize
  } catch (error) {
    console.error("Error calculating total file size:", error);
    throw error;
  }
}
