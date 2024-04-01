import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js"; 
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import {v2 as cloudinary} from "cloudinary";
import {app, server} from './socket/socket.js';
import path from "path";

dotenv.config();

connectDB();

const PORT = 7000;
const __dirname = path.resolve();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//middlewares
app.use(express.json({limit:"50mb"})); //To parse JSON data in the req.body
app.use(express.urlencoded({extended: false})); //To parse form data in req.body
app.use(cookieParser());

//Routes
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/messages", messageRoutes);

//deployment
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req,res)=>{
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}


server.listen(PORT, ()=>{
    console.log(`Server started at PORT ${PORT}!`);
})