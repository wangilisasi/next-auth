"use server";

import * as z from "zod";
import { NewPasswordSchema } from "../schemas";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { getPasswordResetTokenByToken } from "../data/password-reset-token";
import { getUserByEmail } from "../data/user";

import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";

export const newPassowrd = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid Token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  await db.user.update({
    where:{
        id:existingUser.id
    },
    data:{
        password:hashedPassword
    }
  })

  await db.passwordResetToken.delete({
    where:{
        id:existingToken.id
    }
  })

  return {success:"password updated"}
};
