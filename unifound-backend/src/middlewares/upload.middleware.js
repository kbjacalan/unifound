const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// Use memoryStorage — files go to RAM, then we push to Supabase
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Helper to upload a file buffer to Supabase Storage
// Returns the public URL string, or throws on error
const uploadToSupabase = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const { error } = await supabase.storage
    .from("item-images")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from("item-images").getPublicUrl(filename);

  return data.publicUrl; // full https://xxxx.supabase.co/storage/v1/... URL
};

module.exports = { upload, uploadToSupabase };
