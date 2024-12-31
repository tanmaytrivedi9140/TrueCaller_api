import { NextResponse } from "next/server";
import prisma from "@/app/Instances/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { NextApiResponse } from "next";
const JWT_SECRET = process.env.JWT_SECRET || "tanmay";
interface User {
  email?: string;
  PhoneNumber: string;
  Password: string;
}
export async function POST(req: Request, res: NextApiResponse) {
  try {
    const body = await req.json();
    const { email, PhoneNumber, Password }: User = body
     if (!Password || (!email && !PhoneNumber)) {
      return NextResponse.json({
         error: "Email or Phone Number and Password are required",
       }) 
     }
     const user = (await prisma.user.findFirst({
       where: {
         OR: [
           { email: email || undefined },
           { PhoneNumber: PhoneNumber || undefined },
         ],
       },
     })) as {
       id: number;
       email: string;
       PhoneNumber: string;
       Password: string;
     } || null;;
    console.log(user)
     if (!user) {
       NextResponse.json({ error: "User not found" }); 
     }
     console.log(user.Password)
 const passwordMatch = await bcrypt.compare(Password, user.Password);
  console.log(passwordMatch)
 if (!passwordMatch) {
   return NextResponse.json({ error: "Invalid password" });
 }

 // Generate JWT token (Valid for 24 hours)
 const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
 console.log(token)
 // Set HTTP-Only cookie
//  res.setHeader(
//    "Set-Cookie",
//    serialize("token", token, {
//      httpOnly: true,
//      secure:false,
//      sameSite: "lax",
//      maxAge: 24 * 60 * 60, // 24 hours
//      path: "/api/signin",
//    })
//  );

    // Create a new user in the database
    return NextResponse.json({
      message: "signin done successfully",
      status: 200,
    user: { id: user.id, email: user.email, phoneNumber: user.PhoneNumber },
    });
  } catch (error) {
    return NextResponse.json({
      message: "Error signing user",
      status: 400,
      error: error,
    });
  }
}
