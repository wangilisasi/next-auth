"use server";

import * as z from "zod";
import { LoginSchema } from "../schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { getUserByEmail } from "../data/user";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/lib/tokens";
import { sendTwoFactorTokenEmail, sendVerifcationEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "../data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  //Do server side validation as client side validation can easily be bypassed by attackers
  const validatedFields = LoginSchema.safeParse(values); //validate on the backend where no one can manipulate it

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Emailyyy does not exist" };
  }

  if (!existingUser.emailVerified) {
    const verificationTken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerifcationEmail(verificationTken.email, verificationTken.token);
    return { success: "Confirmation email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      //verify code againt the code we have in pur database
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return { error: "Invalid code (No token)!" };
      }
      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Code expired!" };
      }

      //remove the twon factor from db
      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      //check if we have a confirmation
      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id,
          },
        });
      }

      //create
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email: email,
      password: password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Inavlid credentials!" };
        default:
          return { error: "Something went wromg" };
      }
    }

    throw error;
  }
};
