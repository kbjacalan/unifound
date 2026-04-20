const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate the socket connection using the same JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; // attach userId to the socket
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Each user joins their own private room
    socket.join(`user:${socket.userId}`);

    socket.on("disconnect", () => {
      // socket.io handles cleanup automatically
    });
  });

  return io;
};

// Call this anywhere in your backend to push to a specific user
const notifyUser = (userId, notification) => {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification", notification);
};

module.exports = { initSocket, notifyUser };
