import { connectToDatabase } from "@/lib/mongodb";
import Files from "@/models/Files";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { token, types, searchText, sortText, limit } = await req.json();
    await connectToDatabase();

    let currToken=token;
    if(!token){
      const cookieStore =await cookies(); // Access the cookies
      const authToken = cookieStore.get('authToken')?.value;
      if(!authToken){
        return new Response(JSON.stringify({ error: "User need to Login in first" }), {
          status: 500,
        });
      }
      currToken=authToken;
    }  
    const decoded = jwt.verify(
      currToken,
      process.env.JWT_SECRET_KEY as string
    ) as User;

    const id = decoded.userId;
    let query: any = {
      $or: [
        { ownerId: id }, // Match ownerId with token
        { users: decoded.email }, // Match users array with user email
      ],
    };

    // If types array is provided and has elements, add the type filter
    if (types && types.length > 0) {
      query.type = { $in: types }; // Match files whose type is in the types array
    }

    // // If searchText is provided, add the condition to match the name containing searchText
    if (searchText && searchText.trim() !== "") {
      query.name = { $regex: searchText, $options: "i" }; // Case-insensitive regex search
    }

    let sort: any = { createdAt: -1 }; // Default is `createdAt-desc`
    // If sortText is provided, parse it and define the sort object
    if (sortText && sortText.trim() !== '') {
      const [sortBy, orderBy] = sortText.split('-');
      sort = { [sortBy]: orderBy === 'desc' ? -1 : 1 }; // Use the provided field and order
    }
    
    // // If limit is provided, restrict the number of results
    const optionsToLimit = limit ? { limit: limit } : {};

    // Execute the query with optional limit
    const files = await Files.find(query, null, optionsToLimit).populate("ownerId").populate("accountId").sort(sort).exec();
    return new NextResponse(
      JSON.stringify({ Message: "Files fetched", files }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}

export const config = {
  matcher: "/",
};
