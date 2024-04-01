import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';

const app = express(); // Create express app
const server = http.createServer(app); // Create http server using express app 
const io = new Server(server, { // Create socket.io server using http server and cors options
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {}; //userId: socketId

export const getRecipientsSocketId = (recipientId) => {
    return userSocketMap[recipientId];
}

io.on('connection', (socket) => {
    console.log("User connected", socket.id);
    const userId = socket.handshake.query.userId;
    if(userId!==undefined){
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); //Send online users to all clients when a new user connects as ["userId1", "userId2", ...]

    socket.on("markMessagesAsSeen",async({conversationId, userId})=>{
        try {
            await Message.updateMany({
                conversationId,
                seen: false
            },{
                $set: {seen: true}
            })
            await Conversation.updateOne({
                _id: conversationId,
            },{
                $set: {"lastMessage.seen": true}
            })
            io.to(userSocketMap[userId]).emit("messagesSeen", conversationId);
        } catch (error) {
            
        }
    })

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export {io, server, app};
