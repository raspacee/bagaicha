import multer from "multer";

const MAX_IMAGE_SIZE = 8388608;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + Math.round(Math.random() * 500);
    const extension = file.originalname.split(".")[1];
    // req.storedName = name + "." + extension;
    const storedName = name + "." + extension;
    cb(null, storedName);
  },
});

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!SUPPORTED_TYPES.includes(file.mimetype)) {
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
});

export default upload;
