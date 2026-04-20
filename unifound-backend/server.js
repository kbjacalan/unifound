require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const pool = require("./src/config/db");
const { initSocket } = require("./src/socket");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.getConnection();
    console.log("✅ MySQL connected successfully.");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 UniFound API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err.message);
    process.exit(1);
  }
};

start();
