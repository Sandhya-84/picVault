import pool from "../config/db.js";

export const createFolder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, parentFolderId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        // If creating a subfolder, verify the parent belongs to this user
        if (parentFolderId) {
            const parentResult = await pool.query(
                `
                SELECT id
                FROM folders
                WHERE id = $1
                AND user_id = $2
                `,
                [parentFolderId, userId]
            );

            if (parentResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Parent folder not found"
                });
            }
        }

        const result = await pool.query(
            `
            INSERT INTO folders
            (
                user_id,
                name,
                parent_folder_id
            )
            VALUES ($1, $2, $3)

            RETURNING
                id,
                name,
                parent_folder_id,
                created_at
            `,
            [
                userId,
                name.trim(),
                parentFolderId || null
            ]
        );

        return res.status(201).json({
            message: "Folder created successfully",
            folder: result.rows[0]
        });

    } catch (error) {
        console.error("Create folder error:", error);

        return res.status(500).json({
            message: "Unable to create folder"
        });
    }
};
export const getFolders = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                parent_folder_id,
                created_at,
                updated_at
            FROM folders
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            folders: result.rows
        });

    } catch (error) {
        console.error("Get folders error:", error);

        return res.status(500).json({
            message: "Unable to fetch folders"
        });
    }
};
export const renameFolder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const folderId = req.params.id;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        const result = await pool.query(
            `
            UPDATE folders
            SET
                name = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            AND user_id = $3
            RETURNING
                id,
                name,
                parent_folder_id,
                updated_at
            `,
            [
                name.trim(),
                folderId,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Folder not found"
            });
        }

        return res.status(200).json({
            message: "Folder renamed successfully",
            folder: result.rows[0]
        });

    } catch (error) {
        console.error("Rename folder error:", error);

        return res.status(500).json({
            message: "Unable to rename folder"
        });
    }
};
export const deleteFolder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const folderId = req.params.id;

        const result = await pool.query(
            `
            DELETE FROM folders
            WHERE id = $1
            AND user_id = $2
            RETURNING id, name
            `,
            [folderId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Folder not found"
            });
        }

        return res.status(200).json({
            message: "Folder deleted successfully",
            folder: result.rows[0]
        });

    } catch (error) {
        console.error("Delete folder error:", error);

        return res.status(500).json({
            message: "Unable to delete folder"
        });
    }
};