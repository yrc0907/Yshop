import { NextFunction, Request, Response } from "express";
import { AppError } from ".";


export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url}-${err.message}`);

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.log("Unhandled error", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong, please try again later.",
  });
};