import express from "express";

import {
    setupTwoFactor,
    enableTwoFactor
} from "../controllers/twoFactorController.js";

import {
    authenticateToken
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/setup",
    authenticateToken,
    setupTwoFactor
);

router.post(
    "/enable",
    authenticateToken,
    enableTwoFactor
);

export default router;