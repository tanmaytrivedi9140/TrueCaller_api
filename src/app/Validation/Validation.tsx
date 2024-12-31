import { z } from "zod";

// Validation schema using Zod
export const validationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must not exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces",
    }),

  PhoneNumber: z
    .string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),

  email: z
    .string()
    .email({ message: "Invalid email address" }) // Ensures '@' is included
    .regex(/@/, { message: "Email must contain @" }), // Explicit check for '@'
});
export async function validateUserData(data: any): Promise<{message: string}> {
  try {
    // Validate the data using Zod schema
    validationSchema.parse(data); // This will throw an error if validation fails

    // If validation is successful, return true
    return {message: "success"};
  } catch (error) {
    // If validation fails, throw a detailed validation error
    if (error instanceof z.ZodError) {

      return {message: error.errors[0].message};
      
    }
    throw new Error("An unexpected error occurred");
  }
}

