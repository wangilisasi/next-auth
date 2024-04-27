import { db } from "@/lib/db";

export const getVerificatioTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        email: email,
      },
    });
    return verificationToken;
  } catch (error) {
    return null;
  }
};

export const getVerificatioTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        token: token,
      },
    });
    return verificationToken;
  } catch (error) {
    return null;
  }
};
