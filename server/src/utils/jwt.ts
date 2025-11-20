import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        { userId },
        jwtSecret);
};

export const verifyToken = (token: string) => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, jwtSecret);
};
