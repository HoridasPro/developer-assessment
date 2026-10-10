import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // সর্বোচ্চ 5 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "profilePhoto") {
      if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
      }

      return cb(new Error("Profile photo must be an image"));
    }

    if (file.fieldname === "resumeFile") {
      if (file.mimetype === "application/pdf") {
        return cb(null, true);
      }

      return cb(new Error("Resume must be a PDF file"));
    }

    return cb(new Error("Unsupported file field"));
  },
});