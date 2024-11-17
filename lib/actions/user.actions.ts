"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handlelogout() {
  try {
    const cookieStore = await cookies();

    // Delete the authToken cookie
    cookieStore.delete("authToken");
  } catch (e) {
    console.log("error occured while logout", e);
  } finally {
    redirect("/sign-in");
  }
}

export const getCurrentUser = async () => {
  let user = null;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (token) {
    try {
      // Decode the JWT to extract user data
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as User;
      user = {
        name: decoded.name,
        email: decoded.email,
        id: decoded.userId,
      };
      return user;
    } catch (error) {
      throw new Error("JWT decode error:");
    }
  } else {
    console.log("User not found");
  }
};
