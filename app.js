const express = require("express");
const socket = require("socket.io");
const app = express();

app.use(express.static("public"));

let server = app.listen(process.env.PORT || 3000, () => {
    console.log("server started on port 3000");
})

const io = socket(server);
io.on("connection", (socket) => {
    console.log("socket connected");
    socket.on("begin", (data) => {
        console.log(data);
        io.sockets.emit("begin", data);
    })
    socket.on("move", (data) => {
        io.sockets.emit("move", data);
    })
    socket.on("undo", (obj) => {
        io.sockets.emit("undo", obj);
    })
    socket.on("redo", (obj) => {
        io.sockets.emit("redo", obj);
    })
})