import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiError.js';
import { MAX_FILE_SIZE_BYTES } from '../config/constant.js';

// Define ES Modules path utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supported extensions
const ALLOWED_EXTENSIONS = ['.js', '.ts', '.py', '.java', '.c', '.cpp'];

// Memory storage since we parse the code contents and do not need disk persistence
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new ApiError(400, `Unsupported file format. Supported extensions: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }
  
  cb(null, true);
};

export const uploadCodeFile = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter
}).single('codeFile'); // Form field name: 'codeFile'
