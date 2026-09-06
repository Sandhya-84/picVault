import "dotenv/config";

import express from "express";
import cors from "cors";
import pool from "./src/config/db.js";
import authRoutes from "./src/routes/authRoute.js";
import { authenticateToken } from "./src/middleware/authMiddleware.js";
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.get("/",async (req,res)=>{
    try{
        const result = await pool.query("SELECT NOW() AS current_time");
        res.status(200).json({
            message:"Database connection successful",
            time:result.rows[0].current_time
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Database connection failed",
            error:error.message
        });
    }
    
});

app.get(
    "/api/profile",
    authenticateToken,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT
                    id,
                    name,
                    email,
                    storage_limit,
                    two_factor_enabled,
                    created_at
                 FROM users
                 WHERE id = $1`,
                [req.user.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            return res.status(200).json({
                user: result.rows[0]
            });

        } catch (error) {
            console.error("Profile error:", error);

            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
);

app.use("/api/auth",authRoutes);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

