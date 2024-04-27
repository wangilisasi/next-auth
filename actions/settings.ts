"use server";

import * as z from "zod";
import { SettingsSchema } from "../schemas";
import { currentUser } from "@/lib/auth";
import { getUserByEmail, getUserById } from "../data/user";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerifcationEmail } from "@/lib/mail";

import bcryptjs from "bcryptjs"

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  //confirm that the user exist in the database and not some left over session
  const dbUser = await getUserById(user.id as string);

  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  //For oauth iuser these fields we dont want the user to modofy, as they ahandled by the provider
  if (user.isOauth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

//Handle for emails
  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);
    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    const verificationToken = await generateVerificationToken(values.email)

    await sendVerifcationEmail(verificationToken.email,verificationToken.token)

    return {success:"Verification email sent"}
  }

  //Handle for passwords
  if(values.password && values.newPassword && dbUser.password){
    const passwordMatch = await bcryptjs.compare(
        values.password,
        dbUser.password
    )

    if(!passwordMatch){
        return {error:"Incorrect password!"}
    }

    const hashedPassword = await bcryptjs.hash(values.newPassword,10)

    values.password=hashedPassword
    values.newPassword=undefined  //We do this coz we dont even have that field in our database
  }

  // Now update the user by spreding the values the user entered
  await db.user.update({
    where: {
      id: dbUser.id,
    },
    data: {
      ...values,
    },
  });

  return { success: "Settings updated" };
};
