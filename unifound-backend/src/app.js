require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const itemsRoutes = require("./routes/items.routes");
const usersRoutes = require("./routes/users.routes");
const adminItemsRoutes = require("./routes/admin.items.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files — serve uploaded images ──────────────────────────────────
// Accessible at: http://localhost:5000/uploads/items/<filename>
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Health check ───────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "UniFound API is running 🚀", status: "ok" });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin/items", adminItemsRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
