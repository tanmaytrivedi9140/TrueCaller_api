import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/Instances/db"; // Adjust the path to your Prisma instance

// Add a new contact for a user
export async function POST(req: NextRequest) {
  try {
    const { userId, contactId } = await req.json(); // Get userId and contactId from the request body

    // Validate if userId and contactId are provided
    if (!userId || !contactId) {
      return NextResponse.json(
        { error: "userId and contactId are required" },
        { status: 400 }
      );
    }

    // Check if the user and contact exist in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const contact = await prisma.user.findUnique({
      where: { id: contactId },
    });

    if (!user || !contact) {
      return NextResponse.json(
        { error: "User or Contact not found" },
        { status: 404 }
      );
    }

    // Check if the contact already exists in the user's contact list
    const existingContact = await prisma.contact.findUnique({
      where: {
        userId_contactId: {
          userId: userId,
          contactId: contactId,
        },
      },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: "This contact already exists in the user's contact list" },
        { status: 409 }
      );
    }

    // Create a new contact relationship
    await prisma.contact.create({
      data: {
        userId: userId,
        contactId: contactId,
      },
    });

    // Return success message with updated contact details including name, phone, and spam status
    const updatedContacts = await prisma.contact.findMany({
      where: {
        userId: userId,
      },
      include: {
        contact: {
          select: {
            name: true,
            PhoneNumber: true,
            spam: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Contact added successfully",
        contacts: updatedContacts.map((entry) => ({
          name: entry.contact.name,
          phoneNumber: entry.contact.PhoneNumber,
          spam: entry.contact.spam,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error adding contact" },
      { status: 500 }
    );
  }
}
