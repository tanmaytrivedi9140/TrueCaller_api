import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/Instances/db"; // Adjust the path to your Prisma instance

export async function PUT(req: NextRequest) {
  try {
    const { userId, spamStatus } = await req.json();

    // Validate input
    if (typeof userId !== "number" || spamStatus === undefined) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Update the spam status of the user in the global database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { spam: spamStatus },
    });

    // Check if this user is in any contact list and update the spam status for each contact
    const updatedContacts = await prisma.contact.updateMany({
      where: {
        OR: [
          { userId: userId }, // Update if this user is in the user's contact list
          { contactId: userId }, // Update if the user is a contact for another user
        ],
      },
      data: {
        spam: spamStatus, // Update the spam status for each contact in the contact list
      },
    });

    // Return a success response
    return NextResponse.json(
      {
        message: "Spam status updated successfully",
        updatedUser,
        updatedContacts: updatedContacts.count, // Number of updated contacts
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error updating spam status" },
      { status: 500 }
    );
  }
}
