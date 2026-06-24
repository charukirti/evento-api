import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { DatabaseError } from "pg";

import z from "zod";

export function errorHandler(err: unknown, c: Context) {
  // handling validation errors
  if (err instanceof HTTPException && err.cause instanceof z.ZodError) {
    const details = err.cause.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return c.json(
      {
        success: false,
        name: "ValidationException",
        message: "Validation failed",
        errors: details,
      },
      400,
    );
  }

  // handling normal route level exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        name: err.name,
        message: err.message,
      },
      err.status,
    );
  }

  // handling database level errors

  if (err instanceof DatabaseError) {
    switch (err.code) {
      case "23505": // unique constraint voilation
        return c.json(
          {
            success: false,
            name: "DatabaseError",
            message: "This record already exist",
          },
          409,
        );

      case "23503": // foreign key voilation
        if (err.detail?.includes("is still referenced from table")) {
          return c.json(
            {
              success: false,
              name: "DatabaseError",
              message: "Cannot delete, record is still in use",
            },
            409,
          );
        }
        return c.json(
          {
            success: false,
            name: "DatabaseError",
            message: "Record does not exist",
          },
          404,
        );

      case "23502": // null
        return c.json(
          {
            success: false,
            name: "DatabaseError",
            message: "Missing required field",
          },
          400,
        );

      default:
        return c.json(
          {
            success: false,
            name: "DatabaseError",
            message: "database error",
            code: err.code,
          },
          500,
        );
    }
  }

  return c.json(
    {
      success: false,
      name: "InternalServerError",
      message: "Internal server error",
    },
    500,
  );
}