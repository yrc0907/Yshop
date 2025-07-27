export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: string;

  constructor(message: string, statusCode: number, isOperational: boolean = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }

}


// Not found error

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found", details?: any) {
    super(message, 404, true, details);
  }
}

// vaildation Error (use for Joi/zod/react-hook-form validation errors)

export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", details?: any) {
    super(message, 400, true, details);
  }
}


// Unauthorized error

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: any) {
    super(message, 401, true, details);
  }
}

// Auth error

export class AuthError extends AppError {
  constructor(message: string = "Authentication error", details?: any) {
    super(message, 401, true, details);
  }
}

// Forbidden error

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden error", details?: any) {
    super(message, 403, true, details);
  }
}


// Rate Limit Error

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests, please try again later.", details?: any) {
    super(message, 429, true, details);
  }
}

// Internal Server Error
