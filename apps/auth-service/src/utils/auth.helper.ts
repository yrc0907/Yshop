import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { sendEmail } from "./sendMail";
import redis from "../../../../packages/lib/redis";
import { NextFunction } from "express";

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
