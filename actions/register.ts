"use server";

import * as z from "zod";
import bcryptjs from "bcryptjs";

import { RegisterSchema } from "../schemas";
import { db } from "@/lib/db";
import { getUserByEmail } from "../data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerifcationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  //Do server side validation as client side validation can easily be bypassed by attackers
  const validatedFields = RegisterSchema.safeParse(values); //validate on the backend where no one can manipulate it

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  //Extract the validated foelds after they have passed the above line
  const { email, password, name } = validatedFields.data;

  const hashedPassword = await bcryptjs.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);

  //Send verification email
  await sendVerifcationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent" };
};
