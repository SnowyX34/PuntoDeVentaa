"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// src/middlewares/upload.middleware.ts
const multer_1 = __importDefault(require("multer"));
// Configuración para usar memoria en lugar de disco
const storage = multer_1.default.memoryStorage();
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
