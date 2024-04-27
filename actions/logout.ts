"use server";

import { signOut } from "@/auth";

export const logout = async () => {
  //Do some server stuiff befor signing out the user
  await signOut();
};
