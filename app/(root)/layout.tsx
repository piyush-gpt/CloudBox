import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import React from "react";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster"

interface User {
  name: string;
  email: string;
  userId:string
}
const layout = async ({ children }: { children: React.ReactNode }) => {
  let user=null;

  // Get JWT from cookies
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
        id:decoded. userId
      };
    } catch (error) {
      console.error("JWT decode error:", error);
    }
  } 
  
  if(!user){
    redirect("/sign-in");
  }
  return (
    <main className="flex h-screen">
      <Sidebar name={user.name} email={user.email} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...user}/>
        <Header accountId={user.id} ownerId={user.id}/>
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default layout;
