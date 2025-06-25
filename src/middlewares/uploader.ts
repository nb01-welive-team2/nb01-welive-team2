import BadRequestError from "@/errors/BadRequestError";
import { NODE_ENV, PUBLIC_PATH } from "@/lib/constance";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const isProduction = NODE_ENV === "production";
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export const uploader = multer({
  storage: isProduction
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination(req, file, callback) {
          callback(null, PUBLIC_PATH);
        },
        filename(req, file, callback) {
          const ext = path.extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          callback(null, filename);
        },
      }),

  limits: { fieldSize: FILE_SIZE_LIMIT },
  fileFilter(req, file, callback) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const err = new BadRequestError("Only png, jpeg, and jpg are allowed");
      return callback(err);
    }

    callback(null, true);
  },
});
