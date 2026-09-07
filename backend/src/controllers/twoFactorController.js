import {
    generateSecret,
    generateURI,
    verify
} from "otplib";

import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";


// ========================================
// SETUP 2FA
// ========================================

export const setupTwoFactor = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT id, email, two_factor_enabled
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        if (user.two_factor_enabled) {
            return res.status(400).json({
                message: "Two-factor authentication is already enabled"
            });
        }

        // Generate TOTP secret
        const secret = generateSecret();

        // Generate otpauth URI
        const otpauth = generateURI({
            issuer: "PicVault",
            label: user.email,
            secret
        });

        // Convert URI into QR code
        const qrCode = await QRCode.toDataURL(otpauth);

        // Store secret temporarily
        await pool.query(
            `UPDATE users
             SET two_factor_secret = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [secret, userId]
        );

        return res.status(200).json({
            message: "Scan the QR code using your authenticator app",
            qrCode
        });

    } catch (error) {
        console.error("2FA setup error:", error);

        return res.status(500).json({
            message: "Unable to setup two-factor authentication"
        });
    }
};


// ========================================
// ENABLE 2FA
// ========================================

export const enableTwoFactor = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                message: "Authentication code is required"
            });
        }

        const result = await pool.query(
            `SELECT two_factor_secret, two_factor_enabled
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        if (user.two_factor_enabled) {
            return res.status(400).json({
                message: "Two-factor authentication is already enabled"
            });
        }

        if (!user.two_factor_secret) {
            return res.status(400).json({
                message: "Please setup two-factor authentication first"
            });
        }

        const verification = await verify({
            secret: user.two_factor_secret,
            token: String(code)
        });

        if (!verification.valid) {
            return res.status(401).json({
                message: "Invalid authentication code"
            });
        }

        await pool.query(
            `UPDATE users
             SET two_factor_enabled = TRUE,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [userId]
        );

        return res.status(200).json({
            message: "Two-factor authentication enabled successfully"
        });

    } catch (error) {
        console.error("Enable 2FA error:", error);

        return res.status(500).json({
            message: "Unable to enable two-factor authentication"
        });
    }
};


// ========================================
// VERIFY 2FA DURING LOGIN
// ========================================

export const verifyTwoFactorLogin = async (req, res) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) {
            return res.status(400).json({
                message: "Temporary token and authentication code are required"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                tempToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired temporary token"
            });
        }

        if (decoded.purpose !== "2fa") {
            return res.status(401).json({
                message: "Invalid temporary token"
            });
        }

        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                two_factor_enabled,
                two_factor_secret
             FROM users
             WHERE id = $1`,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        if (!user.two_factor_enabled || !user.two_factor_secret) {
            return res.status(400).json({
                message: "Two-factor authentication is not enabled"
            });
        }

        const verification = await verify({
            secret: user.two_factor_secret,
            token: String(code)
        });

        if (!verification.valid) {
            return res.status(401).json({
                message: "Invalid authentication code"
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
                twoFactorEnabled: true
            }
        });

    } catch (error) {
        console.error("2FA login verification error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};