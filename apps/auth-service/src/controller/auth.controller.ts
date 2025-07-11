import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/lib/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestrictions, sendOtp, trackOtpRequests } from "../utils/auth.helper";

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return next(new ValidationError("User already exists with this email"))
    }

    await checkOtpRestrictions(email, next)

    await trackOtpRequests(email, next)

    await sendOtp(name, email, "user-activation-mail")

    res.status(200).json({ message: "OTP sent successfully, please check your email" })
  } catch (error) {
    return next(error);
  }
}
