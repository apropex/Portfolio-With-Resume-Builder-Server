import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { isDev, sCode } from "../../config";
import { deleteImageFromCloud } from "../../config/cloudinary/deleteImageFromCloud";
import ApiError from "../../error-handler/ApiError";

interface ErrorResponse {
  message: string;
  error: {
    code: string;
    path?: string;
    param?: string;
  };
  stack?: string;
}

const prismaErrorMap: Record<string, { statusCode: number; message: string }> =
  {
    // PRISMA: Record not found errors
    P2000: { statusCode: sCode.BAD_REQUEST, message: "Data not found" },
    P2025: { statusCode: sCode.NOT_FOUND, message: "Record not found" },
    // PRISMA: Duplicate/Unique constraint errors
    P2002: {
      statusCode: sCode.CONFLICT,
      message: "Duplicate entry. Record already exists",
    },
    P2010: {
      statusCode: sCode.CONFLICT,
      message: "Unique constraint failed",
    },
    // PRISMA: Foreign key errors
    P2003: {
      statusCode: sCode.BAD_REQUEST,
      message: "Foreign key constraint failed",
    },
    // PRISMA: Database connection errors
    P4000: {
      statusCode: sCode.INTERNAL_SERVER_ERROR,
      message: "Database error",
    },
  };

const globalErrorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let statusCode: number = sCode.INTERNAL_SERVER_ERROR;
  const errorResponse: ErrorResponse = {
    message: "Something went wrong!",
    error: { code: "INTERNAL_ERROR" },
  };

  // ================================
  // 1. CUSTOM API ERROR
  // ================================
  // throw new ApiError() by controller
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorResponse.message = err.message;
    errorResponse.error = {
      code: err.code?.toUpperCase(),
      path: err.path,
      param: err.param,
    };
  }

  // ================================
  // 2. PRISMA ERRORS
  // ================================
  // prisma.user.create() → P2002 (duplicate email)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = prismaErrorMap[err.code] || {
      statusCode: sCode.INTERNAL_SERVER_ERROR,
      message: "Database operation failed",
    };
    statusCode = prismaError.statusCode;
    errorResponse.message = prismaError.message;
    errorResponse.error.code = `PRISMA_${(err as any).code}`;
  }
  // prisma.user.findMany({ where: { age: "invalid" } }) → wrong data type
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = sCode.BAD_REQUEST;
    errorResponse.message = "Invalid query parameters";
    errorResponse.error.code = "PRISMA_VALIDATION_ERROR";
  }
  // Database server down/offline
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = sCode.SERVICE_UNAVAILABLE;
    errorResponse.message = "Database connection failed";
    errorResponse.error.code = "DB_CONNECTION_FAILED";
  }

  // ================================
  // 3. VALIDATION ERRORS
  // ================================
  // Zod schema validation fail (z.string().email())
  else if (err instanceof Error && err.name === "ZodError") {
    statusCode = sCode.BAD_REQUEST;
    errorResponse.message = "Validation failed";
    errorResponse.error.code = "VALIDATION_ERROR";
  }
  // Manual validation error throw
  else if (err instanceof Error && err.name === "ValidationError") {
    statusCode = sCode.BAD_REQUEST;
    errorResponse.message = "Validation failed";
    errorResponse.error.code = "VALIDATION_ERROR";
  }

  // ================================
  // 4. AUTHENTICATION ERRORS (JWT)
  // ================================
  // jwt.verify() → invalid token format
  else if (err instanceof Error && err.name === "JsonWebTokenError") {
    statusCode = sCode.UNAUTHORIZED;
    errorResponse.message = "Invalid token";
    errorResponse.error.code = "INVALID_TOKEN";
  }
  // jwt.verify() → token expired
  else if (err instanceof Error && err.name === "TokenExpiredError") {
    statusCode = sCode.UNAUTHORIZED;
    errorResponse.message = "Token expired";
    errorResponse.error.code = "TOKEN_EXPIRED";
  }

  // ================================
  // 5. FILE UPLOAD ERRORS (MULTER)
  // ================================
  // File size > 5MB limit
  else if (err instanceof Error && "code" in err) {
    const errorCode = (err as any).code;

    switch (errorCode) {
      case "LIMIT_FILE_SIZE":
        statusCode = sCode.BAD_REQUEST;
        errorResponse.message = "File too large";
        break;
      // Multiple files > limit (max 3 files)
      case "LIMIT_FILE_COUNT":
        statusCode = sCode.BAD_REQUEST;
        errorResponse.message = "Too many files";
        break;
      // File field name wrong in form-data
      case "LIMIT_UNEXPECTED_FILE":
        statusCode = sCode.BAD_REQUEST;
        errorResponse.message = "Unexpected file";
        break;
      // Invalid multipart form-data
      case "MULTIPART_INVALID":
        statusCode = sCode.BAD_REQUEST;
        errorResponse.message = "Invalid multipart form";
        break;
      default:
        return;
    }

    errorResponse.error.code = `MULTER_${errorCode.toUpperCase()}`;
  }

  // ================================
  // 6. HTTP REQUEST ERRORS
  // ================================
  // POST body = invalid JSON
  else if (err instanceof SyntaxError && err.message.includes("JSON")) {
    statusCode = sCode.BAD_REQUEST;
    errorResponse.message = "Invalid JSON";
    errorResponse.error.code = "INVALID_JSON";
  }

  // ================================
  // 7. NETWORK/EXTERNAL API ERRORS
  // ================================
  // axios.get('https://down-api.com')
  else if (err instanceof Error && "code" in err) {
    const netCode = (err as any).code;
    if (netCode === "ENOTFOUND") {
      statusCode = sCode.SERVICE_UNAVAILABLE;
      errorResponse.message = "Service unavailable";
      errorResponse.error.code = "SERVICE_UNAVAILABLE";
    }
    // External API server not responding
    else if (netCode === "ECONNREFUSED") {
      statusCode = sCode.SERVICE_UNAVAILABLE;
      errorResponse.message = "Service connection refused";
      errorResponse.error.code = "CONNECTION_REFUSED";
    }
  }

  // ================================
  // 8. EMAIL ERRORS (Nodemailer)
  // ================================
  // Wrong SMTP password
  else if (err instanceof Error && "code" in err) {
    const emailCode = (err as any).code;
    if (emailCode === "EAUTH") {
      statusCode = sCode.INTERNAL_SERVER_ERROR;
      errorResponse.message = "Email service authentication failed";
      errorResponse.error.code = "EMAIL_AUTH_FAILED";
    }
    // Invalid recipient email
    else if (emailCode === "EENVELOPE") {
      statusCode = sCode.BAD_REQUEST;
      errorResponse.message = "Invalid email recipient";
      errorResponse.error.code = "INVALID_EMAIL";
    }
  }

  // ================================
  // 9. JAVASCRIPT NATIVE ERRORS
  // ================================
  // undefined.property
  else if (err instanceof TypeError) {
    statusCode = sCode.INTERNAL_SERVER_ERROR;
    errorResponse.message = "Invalid operation";
    errorResponse.error.code = "TYPE_ERROR";
  }
  // Array index out of bounds
  else if (err instanceof RangeError) {
    statusCode = sCode.BAD_REQUEST;
    errorResponse.message = "Value out of range";
    errorResponse.error.code = "RANGE_ERROR";
  }
  // undefinedFunction()
  else if (err instanceof ReferenceError) {
    statusCode = sCode.INTERNAL_SERVER_ERROR;
    errorResponse.message = "Internal reference error";
    errorResponse.error.code = "REFERENCE_ERROR";
  }

  // ================================
  // 10. GENERIC ERROR
  // ================================
  // fallback of all errors
  else if (err instanceof Error) {
    statusCode = sCode.INTERNAL_SERVER_ERROR;
    errorResponse.message = err.message || "Something went wrong!";
    errorResponse.error.code = "GENERIC_ERROR";
  }

  // ================================
  // PRODUCTION SAFETY + LOGGING
  // ================================
  if (!isDev && err instanceof Error) {
    delete errorResponse.stack; // Production: Hide stack trace
  } else if (isDev && (err instanceof Error || err instanceof ApiError)) {
    errorResponse.stack = err.stack; // Development: Show stack trace
  }

  if (isDev && (err instanceof Error || err instanceof ApiError)) {
    console.error("🚨 [ERROR]", {
      statusCode,
      message: errorResponse.message,
      path: req.path,
      method: req.method,
      code: errorResponse.error.code,
    });
  }

  if (req.file && req.file.path) await deleteImageFromCloud(req.file.path);

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = req.files?.map((file) => file.path);

    await Promise.all(imageUrls.map((url) => deleteImageFromCloud(url)));
  }

  res.status(statusCode).json({ success: false, ...errorResponse });
};

export default globalErrorHandler;
