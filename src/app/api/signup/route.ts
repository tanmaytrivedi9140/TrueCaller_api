import { NextResponse } from "next/server";
import prisma from "@/app/Instances/db";
import { validateUserData } from "@/app/Validation/Validation";
import bcrypt from "bcrypt";

interface User {
  name: string;
  email: string;
  PhoneNumber: string;
  Password: string;
}
export async function POST(req: Request , res: Response) {
    try {
        
        const body = await req.json();
        const { email, PhoneNumber, name, Password }:User = body;
        console.log(email)
          const isValid = await validateUserData({
            name,
            PhoneNumber,
            email,
            Password
          });
          if(isValid.message != "success"){
            return NextResponse.json({ message: isValid.message, status: 400 });
          }
          
        console.log(email)
        const existingUser = await prisma.user.findUnique({
          where: {  PhoneNumber },
        });
         console.log(existingUser)
        if (existingUser) {
          return NextResponse.json({
            message: "Phone number already exists",
            status: 400
          });
        }
        
         const hashedPassword = await bcrypt.hash(Password, 10);
          console.log(hashedPassword)
         // Create a new user in the database
         const newUser = await prisma.user.create({
           data: {
             name: name,
             PhoneNumber: PhoneNumber,
             email: email,
             Password: hashedPassword, // Store the hashed password
          
           },
         });
        return NextResponse.json({ message: "User created successfully",
           user: {
             id: newUser.id,
             name: newUser.name,
             phoneNumber: newUser.PhoneNumber,
             email: newUser.email,
           },
         });
    } catch (error) {
        
        return NextResponse.json({ message: "Error creating user", status: 400 , error: error });
    }

}



