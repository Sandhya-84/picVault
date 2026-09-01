import express from 'express';
import dotenv from 'dotenv';
import pool from "./src/config/db.js";
dotenv.config();
const app = express();
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
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

