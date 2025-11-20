import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    if (error.name === 'MongoServerError' && 'code' in error && error.code === 11000) {
        statusCode = 400;
        const field = Object.keys((error as any).keyValue)[0];
        message = `${field} already exists`;
    }

    if (error.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values((error as any).errors).map((val: any) => val.message);
        message = errors.join(', ');
    }

    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
