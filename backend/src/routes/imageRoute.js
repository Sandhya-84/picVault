import express from "express";
import {
    uploadImage,getImages,deleteImage,renameImage,downloadImage
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
router.delete(
    "/:id",
    authenticateToken,
    deleteImage
);
router.get("/",authenticateToken,getImages);
router.patch(
    "/:id/rename",
    authenticateToken,
    renameImage
);
router.get(
    "/:id/download",
    authenticateToken,
    downloadImage
);

export default router;