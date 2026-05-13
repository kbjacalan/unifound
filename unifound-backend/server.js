require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const supabase = require("./src/config/db");
const { initSocket } = require("./src/socket");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Verify Supabase connection by doing a lightweight query
    const { error } = await supabase.from("roles").select("id").limit(1);
    if (error) throw new Error(error.message);
    console.log("✅ Supabase connected successfully.");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 UniFound API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to Supabase:", err.message);
    process.exit(1);
  }
};

start();
