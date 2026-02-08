require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// this code will removed after deploy the app
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

require('./utils/dbConnect');
const Message = require('./models/messageModel');

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(express.json());
app.use(cors({
    origin: CLIENT_URL,
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const machineRentalRoutes = require('./routes/machineRentalRoutes');
const likeRoutes = require('./routes/likeRoutes');
const laborRoutes = require('./routes/laborRoutes');
const chatbotsRoutes = require("./routes/chatbotsRoutes")
// const searchRoutes = require('./routes/searchRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/file', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/machine-rental', machineRentalRoutes);
app.use('/api/like', likeRoutes)
app.use('/api/labor', laborRoutes);
app.use('/api/chat-bot', chatbotsRoutes);
// app.use('/api/search', searchRoutes)

io.on('connection', (socket) => {
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
    });

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, content } = data;
        try {
            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                content: content
            });
            await newMessage.save();

            io.to(senderId).emit('receiveMessage', newMessage);
            io.to(receiverId).emit('receiveMessage', newMessage);
        } catch (error) {
            socket.emit('messageError', 'Failed to send message');
        }
    });

    socket.on('disconnect', () => {
    });
});

app.get('/', (req, res) => {
    res.send('Final year project (Agri sathi hub) website backend running...');
});

server.listen(PORT, () => {
    console.log(`Agri sathi hub - Server running on port ${PORT}`);
});