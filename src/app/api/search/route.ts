import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/Instances/db"; // Adjust the path to your Prisma instance

// Search route to handle both contact array search and global database search
interface Contact {
  name: string;
  PhoneNumber: string;
  spam: boolean;

}
interface globalContact {

  PhoneNumber: string;
  spam: boolean;
}
export async function GET(req: NextRequest) {
  try {
    // Extract 'query' (search term) and 'type' from URL parameters
    const query = req.nextUrl.searchParams.get("query"); // Get query parameter (e.g., phone number or name)
    const type = req.nextUrl.searchParams.get("type"); // Get the type of search (e.g., 'phone' or 'name')

    // Validate that query and type are present
    if (!query || !type) {
      return NextResponse.json(
        { error: "Both 'query' and 'type' parameters are required" },
        { status: 400 }
      );
    }

    // Get the current user from the request (replace this with actual user session logic)
    const userId = 1; // You can get this from the session or authentication middleware

    let contacts: Contact[] = [];
    let globalContacts: globalContact[] = [];

    if (type === "phone") {
      // 1. Search in User's contacts for the given phone number
      const userContacts = await prisma.contact.findMany({
        where: {
          userId: userId, // The user currently logged in
          contact: {
            PhoneNumber: {
              contains: query, // Search by phone number in the user's contacts
              mode: "insensitive", // Case-insensitive search
            },
          },
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

      // If user contacts are found, return the list of contacts
      if (userContacts.length > 0) {
        contacts = userContacts.map((entry) => ({
          name: entry.contact.name,
          PhoneNumber: entry.contact.PhoneNumber,
          spam: entry.contact.spam,
        }));
         return NextResponse.json(
      {
        message: "user Contacts found",
        contacts,
      },
      { status: 200 }
    )
      }
       
      // 2. If no contacts are found in the user's contact list, search in the global database
      if (contacts.length === 0) {
        const globalContactsbyPhone = await prisma.user.findMany({
          where: {
            PhoneNumber: {
              contains: query, // Search for the phone number globally
              mode: "insensitive", // Case-insensitive search
            },
          },
          select: {
            PhoneNumber: true,
            spam: true,
          },
        });

        // If no global contacts are found
        if (globalContactsbyPhone.length === 0) {
          return NextResponse.json(
            { error: "No contacts found with the given phone number" },
            { status: 404 }
          );
        }

        // Add global contacts to the list
        globalContacts = globalContactsbyPhone;
      }
    } else if (type === "name") {
      // 3. Search for names in the global database if 'type' is 'name'
      const globalContactsByName = await prisma.user.findMany({
        where: {
          name: {
            contains: query, // Search by name
            mode: "insensitive", // Case-insensitive search
          },
        },
        select: {
          PhoneNumber: true,
          spam: true,
        },
      });

      // If no contacts are found with the given name
      if (globalContactsByName.length === 0) {
        return NextResponse.json(
          { error: "No contacts found with the given name" },
          { status: 404 }
        );
      }

      // Return contacts by name
      globalContacts = globalContactsByName;
    } else {
      // If 'type' is neither 'phone' nor 'name', return an error
      return NextResponse.json(
        { error: "'type' parameter must be either 'phone' or 'name'" },
        { status: 400 }
      );
    }

    // Return the contacts found
    return NextResponse.json(
      {
        message: "Contacts found",
        globalContacts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error searching for contacts" },
      { status: 500 }
    );
  }
}
