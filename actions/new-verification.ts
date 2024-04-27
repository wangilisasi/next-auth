"use server";

import { db } from "@/lib/db";
import { getVerificatioTokenByToken } from "../data/verification-token";
import { getUserByEmail } from "../data/user";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificatioTokenByToken(token);

  if (!existingToken) {
    return { error: "No existing token" }; // We are not gonna veryfy your email
  }

  const hasExprired = new Date(existingToken.expires) < new Date();

  if(hasExprired){
    return {error:"Token has expired"}
  }

  const existingUser = await getUserByEmail(existingToken.email)

  if(!existingUser){
    return {error:"Email does not exist"}  //Maybe the use changed their email
  }

  //If all have passes we can finally upodat the emailverfiroed
  await db.user.update({
    where:{
        id:existingUser.id
    },
    data:{
        emailVerified:new Date(),
        email:existingToken.email    //Can help the user update their email
    }
  })

  //Delete the verification token
  await db.verificationToken.delete({
    where:{
        id:existingToken.id
    }
  })

  return {success:"Email Verified"}
};
