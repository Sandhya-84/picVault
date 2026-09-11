import express from "express";

import {
    createFolder,
    getFolders,
    renameFolder,
    deleteFolder
} from "../controllers/folderController.js";

import {
    authenticateToken
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    createFolder
);
router.get(
    "/",
    authenticateToken,
    getFolders
);
router.patch(
    "/:id",
    authenticateToken,
    renameFolder
);

router.delete(
    "/:id",
    authenticateToken,
    deleteFolder
);

export default router;