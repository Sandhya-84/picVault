import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {
    registerSchema,
    loginSchema
} from "../validators/authValidators.js";
export const register = async (req, res) => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success){
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.issues.map((issue)=>({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }
        const {
            name,
            email,
            password
        } = validation.data;

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }
        const passwordHash = await bcrypt.hash(
            password,
            12
        );
        const result = await pool.query(
            `INSERT INTO users
             (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING
             id,
             name,
             email,
             storage_limit,
             created_at`,
            [
                name,
                email,
                passwordHash
            ]
        );
        return res.status(201).json({
            message: "Registration successful",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
export const login = async (req, res) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.issues.map((issue)=>({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }
        const {
            email,
            password
        } = validation.data;
        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                password,
                two_factor_enabled
             FROM users
             WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const user = result.rows[0];
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );
        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1h"
            }
        );
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                twoFactorEnabled: user.two_factor_enabled
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};