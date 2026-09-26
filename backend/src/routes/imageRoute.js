import express from "express";

import {
    uploadImage,
    getImages,
    deleteImage,
    renameImage,
    downloadImage,
    getStorageUsage,
    lockImage,
    unlockImage,
    moveImage,
    getFolderImages
} from "../controllers/imageController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/upload",
    authenticateToken,
    upload.single("image"),
    uploadImage
);

router.get(
    "/",
    authenticateToken,
    getImages
);

router.get(
    "/storage/usage",
    authenticateToken,
    getStorageUsage
);

router.get(
    "/folder/:id",
    authenticateToken,
    getFolderImages
);

router.get(
    "/:id/download",
    authenticateToken,
    downloadImage
);

router.patch(
    "/:id/rename",
    authenticateToken,
    renameImage
);

router.patch(
    "/:id/lock",
    authenticateToken,
    lockImage
);

router.patch(
    "/:id/unlock",
    authenticateToken,
    unlockImage
);

router.patch(
    "/:id/move",
    authenticateToken,
    moveImage
);

router.delete(
    "/:id",
    authenticateToken,
    deleteImage
);

export default router;