const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store active users and rooms
const activeUsers = new Set();
const rooms = [
  { id: "room1", name: "General" },
  { id: "room2", name: "Random" },
  { id: "room3", name: "Tech" },
];
const userRooms = {};
const messages = {};
io.on("connection", (socket) => {
  // Check if username exists
  socket.on("check_username", (username, callback) => {
    const exists = activeUsers.has(username);
    callback({ exists });
  });

  // Handle user login
  socket.on("user_login", (username) => {
    activeUsers.add(username);
    socket.username = username;
    io.emit("user_status_change", {
      username,
      status: "online",
      room: userRooms[username] || null,
    });
  });

  //Create room
  socket.on("create_room", (roomName) => {
    const newRoom = { id: `${Date.now()}`, name: roomName };
    rooms.push(newRoom);
    io.emit("new_room", newRoom);
  });

  // Get available rooms
  socket.on("get_rooms", (callback) => {
    callback(rooms);
  });

  // Join room
  //   socket.on("join_room", (roomId) => {
  //     socket.join(roomId);
  //     socket.to(roomId).emit("message_received", {
  //       text: `${socket.username} has joined the room`,
  //       username: "System",
  //       isSystem: true,
  //     });
  //   });
  socket.on("join_room", ({ roomId, roomName }) => {
    if (socket.username) {
      userRooms[socket.username] = { roomId, roomName };
      console.log(userRooms[socket.username]);
      socket.join(roomId);
      if (messages[roomId]) {
        socket.emit("prev_messages", messages[roomId]);
      } else {
        messages[roomId] = [];
      }
      io.emit("user_status_change", {
        username: socket.username,
        status: "online",
        room: userRooms[socket.username],
      });

      socket.to(roomId).emit("message_received", {
        text: `${socket.username} has joined the room`,
        username: "System",
        isSystem: true,
      });
    }
  });

  // Leave room
  //   socket.on("leave_room", (roomId) => {
  //     socket.leave(roomId);
  //     socket.to(roomId).emit("message_received", {
  //       text: `${socket.username} has left the room`,
  //       username: "System",
  //       isSystem: true,
  //     });
  //   });
  socket.on("leave_room", (roomId) => {
    if (socket.username) {
      delete userRooms[socket.username];
      socket.leave(roomId);
      io.emit("user_status_change", {
        username: socket.username,
        status: "online",
        room: null,
      });
      socket.to(roomId).emit("message_received", {
        text: `${socket.username} has left the room`,
        username: "System",
        isSystem: true,
      });
    }
  });
  // Handle messages
  socket.on("send_message", ({ room, message, username }) => {
    const msg = {
      text: message,
      username,
      // isOwn: false,
    };
    messages[room].push(msg);
    console.log(room, messages[room]);
    io.to(room).emit("message_received", msg);
  });

  // socket.on("get_active_users", (callback) => {
  //   callback([...activeUsers]);
  // });
  // Handle user logout
  //   socket.on("user_logout", (username) => {
  //     activeUsers.delete(username);
  //     io.emit("user_status_change", { username, status: "offline" });
  //   });
  socket.on("user_logout", (username) => {
    if (username) {
      activeUsers.delete(username);
      delete userRooms[username];
      io.emit("user_status_change", {
        username,
        status: "offline",
        room: null,
      });
    }
  });

  // Handle disconnection
  //   socket.on("disconnect", () => {
  //     if (socket.username) {
  //       activeUsers.delete(socket.username);
  //       io.emit("user_status_change", {
  //         username: socket.username,
  //         status: "offline",
  //       });
  //     }
  //   });
  socket.on("disconnect", () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      delete userRooms[socket.username];
      io.emit("user_status_change", {
        username: socket.username,
        status: "offline",
        room: null,
      });
    }
  });

  socket.on("get_active_users", (callback) => {
    const users = [...activeUsers].map((user) => ({
      username: user,
      room: userRooms[user] || null,
    }));
    callback(users);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
