import multer from "multer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

export default upload;
