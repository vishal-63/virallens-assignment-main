import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateToken } from "../utils/jwt";
import { authenticateToken } from "../middleware/auth";
import { authLimiter, createAccountLimiter } from "../middleware/rateLimiter";
import { IUserResponse } from "../types/User";

const router = Router();

const signupValidation = [
    body("name")
        .trim()
        .isLength({ min: 2 })
        .escape()
        .withMessage("Please provide a valid name"),
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

const signinValidation = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
];

router.post(
    "/signup",
    createAccountLimiter,
    signupValidation,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }

            const { name, email, password } = req.body;

            const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: "User with this email already exists",
                });
                return;
            }

            const user = new User({
                name,
                email,
                password: hashedPassword,
            });

            await user.save();

            const token = generateToken(String(user._id));

            const userResponse = {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            };

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: userResponse,
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

router.post(
    "/signin",
    authLimiter,
    signinValidation,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email }).select("+password");
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }

            const token = generateToken(String(user._id));

            const userResponse: IUserResponse = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            };

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });
            res.status(200).json({
                success: true,
                message: "Login successful",
                user: userResponse,
            });
        } catch (error) {
            console.error("Signin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

router.get(
    "/me",
    authenticateToken,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            const userResponse: IUserResponse = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            };

            res.json({
                success: true,
                user: userResponse,
            });
        } catch (error) {
            console.error("Get user error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

router.post(
    "/logout",
    authenticateToken,
    (req: Request, res: Response): void => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.json({
            success: true,
            message: "Logout successful",
        });
    }
);

export default router;
