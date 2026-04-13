"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Asegurar que el directorio uploads existe (opcional, si aún quieres guardar archivos)
const uploadDir = path_1.default.join(__dirname, '../../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// CAMBIO IMPORTANTE: Usar memoryStorage en lugar de diskStorage
const storage = multer_1.default.memoryStorage(); // ¡Esto es lo que necesita Cloudinary!
// Si necesitas también guardar en disco, puedes usar un middleware adicional
// pero para Cloudinary necesitas el buffer en memoria
const fileFilter = (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF y WebP.'), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                msg: 'El archivo es demasiado grande. El tamaño máximo es 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                msg: 'Solo se permite un archivo por vez.'
            });
        }
    }
    if (error.message && error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            msg: error.message
        });
    }
    next(error);
};
exports.handleMulterError = handleMulterError;
