const express = require('express');
const app = express()
const http = require('http');
const ACTIONS = require('./src/Actions');

const { Server } = require('socket.io');
const path = require('path');
const server = http.createServer(app);

const io = new Server(server);
const userSocketMap = {};

app.use(express.static('build'))
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
function getAllConnectedClients(RoomId) {
    return Array.from(io.sockets.adapter.rooms.get(RoomId) || []).map((socketId) => {
        return (
            {
                socketId,
                username: userSocketMap[socketId]
            }
        )
    })
}

io.on('connection', (socket) => {
    console.log(socket.id);
    socket.on(ACTIONS.JOIN, ({ RoomId, UserName }) => {
        // console.log(data);
        userSocketMap[socket.id] = UserName
        // console.log(userSocketMap);
        socket.join(RoomId);
        const clients = getAllConnectedClients(RoomId)
        console.log(clients);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                UserName,
                socketId: socket.id
            })
        })
    })
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Running On Port ${PORT}`);
})