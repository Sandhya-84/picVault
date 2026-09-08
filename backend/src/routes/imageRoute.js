import express from "express";

import {
    uploadImage
} from "../controllers/imageController.js";

import {
    authenticateToken
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/upload",
    authenticateToken,
    upload.single("image"),
    uploadImage
);

export default router;