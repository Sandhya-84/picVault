import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./src/config/db.js";
import authRoutes from "./src/routes/authRoute.js";
import twoFactorRoutes from "./src/routes/twoFactorRoute.js";
import imageRoutes from "./src/routes/imageRoute.js";
import folderRoutes from "./src/routes/folderRoute.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/2fa", twoFactorRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/folders", folderRoutes);
app.get("/", async (req, res) => {
    try {
        const result =
            await pool.query("SELECT NOW()");
        res.json({
            message: "PicVault API running",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database error"
        });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});