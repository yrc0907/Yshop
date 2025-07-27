import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/lib/prisma";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

// User registration
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

// Verify user
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are required!"));
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email"))
    }

    await verifyOtp(email, otp, next)

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    })

  } catch (error) {
    return next(error);
  }
};

// Login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new AuthError("User doesn't exists!"));

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    // Generate access and refresh token
    const accessToken = jwt.sign({ id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign({ id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    setCookie(res, "accessToken", accessToken);
    setCookie(res, "refreshToken", refreshToken);


    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    return next(error);
  }
};


// Forgot user password
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  await handleForgotPassword(req, res, next, "user");

}

// Verify user password
export const verifyUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  await verifyForgotPasswordOtp(req, res, next);
}


// Reset user password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required"));
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new ValidationError("User not found"));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(new ValidationError("New password cannot be the same as the old password"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword
      }
    })

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    })
  } catch (error) {
    return next(error);
  }
}
