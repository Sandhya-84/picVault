import {
    PutObjectCommand
} from "@aws-sdk/client-s3";

import storageClient from "../config/storage.js";
import pool from "../config/db.js";

export const uploadImage = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                message: "Image file is required"
            });
        }

        const file = req.file;

        const storageResult = await pool.query(
            `
            SELECT
                u.storage_limit,
                COALESCE(SUM(i.size_bytes), 0) AS storage_used
            FROM users u
            LEFT JOIN images i
                ON i.user_id = u.id
            WHERE u.id = $1
            GROUP BY
                u.id,
                u.storage_limit
            `,
            [userId]
        );

        if (storageResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const storageLimit = Number(
            storageResult.rows[0].storage_limit
        );

        const storageUsed = Number(
            storageResult.rows[0].storage_used
        );

        const remainingStorage =
            storageLimit - storageUsed;

        if (file.size > remainingStorage) {
            return res.status(400).json({
                message: "Not enough storage space"
            });
        }

        const safeName = file.originalname.replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
        );

        const storageKey =
            `users/${userId}/${Date.now()}-${safeName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.MINIO_BUCKET,
            Key: storageKey,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await storageClient.send(command);

        const result = await pool.query(
            `
            INSERT INTO images
            (
                user_id,
                original_name,
                storage_key,
                mime_type,
                size_bytes
            )
            VALUES
            ($1, $2, $3, $4, $5)

            RETURNING
                id,
                original_name,
                storage_key,
                mime_type,
                size_bytes,
                is_locked,
                created_at
            `,
            [
                userId,
                file.originalname,
                storageKey,
                file.mimetype,
                file.size
            ]
        );

        return res.status(201).json({
            message: "Image uploaded successfully",

            image: result.rows[0],

            storage: {
                used: storageUsed + file.size,
                remaining: remainingStorage - file.size,
                limit: storageLimit
            }
        });

    } catch (error) {
        console.error(
            "Image upload error:",
            error
        );

        return res.status(500).json({
            message: "Unable to upload image"
        });
    }
};