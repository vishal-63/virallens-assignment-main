import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const status = err.statusCode || 500;

    const response = {
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    res.status(status).json(response);
};

