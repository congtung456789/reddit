const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const minioUtils = require("./MinioUtils");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
  }, maxHttpBufferSize: 3e8
});
const PORT = process.env.PORT || 8000;

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
    users.push({userId, socketId});
    console.log("Add user success "+ userId + " ----- "+ socketId);
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
    console.log("remove user success "+socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    console.log("user connected");
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        console.log(userId);
        io.emit("getUsers", users);
    });

    //send, get message
    socket.on("sendMessage", ({senderId, receiverId, text}) => {
        console.log("users: " + users);
        console.log("message is" + text);
        receiverId.forEach((value,index)=>{
            const user = getUser(value);
            console.log(user);
            io.to(user?.socketId).emit("getMessage", {
                senderId,
                text,
            });
        });
    });
    // Handle image
    socket.on("sendPhoto", async ({senderId, receiverId, data,fileName}) => {
        console.log("users send image : " + users);
        let urlFileName = "Error! can't send file";
        try{
            urlFileName =  await minioUtils.uploadFile(data, process.env.MINIO_BUCKET_MESSAGE, fileName);
        }catch (Error){
            console.log(Error);
        }
        receiverId.forEach((value,index)=>{
            const user = getUser(value);
            io.to(user?.socketId).emit("receiveImage", {
                senderId,
                urlFileName,
            });
        });
        console.log("Send image success!");
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
