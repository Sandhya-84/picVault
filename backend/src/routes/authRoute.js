import express from "express";

import {
    register,
    login
} from "../controllers/authController.js";

import {
    verifyTwoFactorLogin
} from "../controllers/twoFactorController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post(
    "/verify-two-factor",
    verifyTwoFactorLogin
);

export default router;