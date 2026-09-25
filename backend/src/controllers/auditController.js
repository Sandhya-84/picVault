import pool from "../config/db.js";

export const getAuditLogs = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                id,
                action,
                resource_type,
                resource_id,
                details,
                ip_address,
                created_at
            FROM audit_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            logs: result.rows
        });

    } catch (error) {
        console.error(
            "Get audit logs error:",
            error
        );

        return res.status(500).json({
            message: "Unable to fetch audit logs"
        });
    }
};