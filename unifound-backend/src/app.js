require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const itemsRoutes = require("./routes/items.routes");
const usersRoutes = require("./routes/users.routes");
const claimsRoutes = require("./routes/claims.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "UniFound API is running 🚀", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorHandler);

module.exports = app;
