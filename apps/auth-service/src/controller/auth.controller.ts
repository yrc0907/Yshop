import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/lib/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestrictions } from "../utils/auth.helper";

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
    const newUser = await prisma.user.create({ data: { name, email, imagesId: "" } })

    res.status(201).json({ message: "User created successfully", user: newUser })
  } catch (error) {
    next(error);
  }
}
