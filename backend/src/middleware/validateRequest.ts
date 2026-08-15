import { Request, Response, NextFunction } from 'express';

/**
 * Basic validation middleware.
 * Ensures the specified fields exist in the request body.
 */
export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter((field) => {
      const val = req.body[field];
      return val === undefined || val === null || val === '';
    });

    if (missing.length > 0) {
      res.status(400).json({
        error: {
          message: `Missing required fields: ${missing.join(', ')}`,
          statusCode: 400,
        },
      });
      return;
    }

    next();
  };
}
