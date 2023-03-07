import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import cloudinary from "cloudinary";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";

import { UserController, MessageController } from "./controllers/index.js";
import { registerValidation, loginValidation } from "./validation.js";
import { handleValidationErrors, checkAuth } from "./utils/index.js";

const app = express();
app.use(express.json());
app.use(cors());

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("DB Ok"))
    .catch(err => console.log("ERROR", err));

cloudinary.config({
    cloud_name: process.env.CLOUD_API_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// завантаження файлів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// реєстрація
app.post("/auth/register", registerValidation, handleValidationErrors, UserController.register);
// авторизація
app.post("/auth/login", loginValidation, handleValidationErrors, UserController.login);
// перевірка права доступу
app.get("/auth/me", checkAuth, UserController.getMe);
// список всіх юзерів
app.get("/allUsers/:id", UserController.getAllUsers);
// додати повідомлення
app.post("/addMessage", MessageController.addMessage);
// отримати всі повідомлення з чату з вибраним юзером
app.post("/getMessages", MessageController.getMessages);

// завантаження файлів
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;

        const result = await cloudinary.uploader.upload(file.path, {
            public_id: "olympic_flag",
        });

        res.json(result);
    } catch (err) {
        console.log(err);
        res.json(err);
    }
});

const server = app.listen(4444, err => {
    if (err) {
        return console.log(err);
    }
    console.log("Server OK");
});
// const server = app.listen("https://chat-0y1j.onrender.com/", err => {
//     if (err) {
//         return console.log(err);
//     }
//     console.log("Server OK");
// });

// sockets
const io = new Server(server, {
    cors: {
        // origin: "http://localhost:3000",
        // origin: "https://live-chat-theta.vercel.app/",
        origin: "*",
        credentials: true,
    },
});

// по кліку на юзера ми відкриваємо сокет-чат з ним
// на фронті має бути он з ресівед меседжес, який записує отриману дату в стейт з усіма повідомлення чату
// (list) => [...list, data]

global.onlineUsers = new Map();

io.on("connection", socket => {
    global.chatSocket = socket;

    // when user logged in add him to the onlineUsers Array
    socket.on("add-user", userId => {
        // console.log(onlineUsers);
        onlineUsers.set(userId, socket.id);
        // console.log(userId);
        console.log(onlineUsers);
    });

    socket.on("send-message", data => {
        // find user to whom it was send
        const sendUserSocket = onlineUsers.get(data.to);
        // if user online to whom it was send. If he is not online he will get a msg from the database after the next logged in

        if (sendUserSocket) {
            // send him msg
            socket.to(sendUserSocket).emit("msg-receive", data.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });
});
