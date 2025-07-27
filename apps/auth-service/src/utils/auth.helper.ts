import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { sendEmail } from "./sendMail";
import redis from "../../../../packages/lib/redis";
import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/lib/prisma";

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
  const { name, email, password, phone_number, country } = data;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !password || userType === "seller" && !phone_number || !country) {
    throw new ValidationError("Invalid registration data");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format")
  }

}


export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts! Try again after 30 minutes"
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many requests, please try 1 hour later."
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        "Please wait 1 minute before requesting a new OTP."
      )
    );
  }
};


export const trackOtpRequests = async (
  email: string,
  next: NextFunction
) => {
  const otpRequestKey = `otp_request:${email}`;
  let otpRequests = parseInt(await redis.get(otpRequestKey) || "0");

  if (otpRequests >= 10000) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
    return next(new ValidationError("Too many requests, please try again after 1 hour."));
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);

}

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Yshop", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp || storedOtp !== otp) {
    return next(new ValidationError("Incorrect OTP"))
  }

  const failedAttemptsKey = `otp_failed_attempts:${email}`;

  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock for 3
      await redis.del(`otp:${email}`, failedAttemptsKey);
      return next(
        new ValidationError(
          "Too many failed attempts. Your account is locked for 30 minutes!"
        )
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);

    return next(
      new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`)
    );
  }
}

export const handleForgotPassword = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError("Email is required"));
    }

    // Find User
    const user = userType === "user" && await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return next(new ValidationError("User not found"));
    }

    await checkOtpRestrictions(email, next);

    await trackOtpRequests(email, next);

    await sendOtp(email, user.name, "forgot-password-user-mail")

    res.status(200).json({
      success: true,
      message: "OTP sent successfully, please check your email"
    })

  } catch (error) {
    return next(error);
  }
}

export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ValidationError("Email and OTP are required"));
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully,You can now reset your password"
    })

  } catch (error) {
    return next(error);
  }
}