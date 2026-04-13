import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurar que el directorio uploads existe (opcional, si aún quieres guardar archivos)
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// CAMBIO IMPORTANTE: Usar memoryStorage en lugar de diskStorage
const storage = multer.memoryStorage(); // ¡Esto es lo que necesita Cloudinary!

// Si necesitas también guardar en disco, puedes usar un middleware adicional
// pero para Cloudinary necesitas el buffer en memoria

const fileFilter = (req: any, file: any, cb: any) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF y WebP.'), false);
    }
};

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
// Middleware para manejar errores de multer
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
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