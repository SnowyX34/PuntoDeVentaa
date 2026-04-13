// src/middlewares/upload.middleware.ts
import multer from 'multer';

// Configuración para usar memoria en lugar de disco
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});