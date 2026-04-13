import { Router } from 'express';
import { getUserName } from '../controllers/navbar.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

// Se define la ruta para obtener el nombre de un usuario específico, protegida por el middleware de verificación de token JWT para asegurar que solo los usuarios autenticados puedan acceder a esta información, llamando al controlador que maneja la lógica para recuperar el nombre del usuario a partir de su ID
router.get('/:userId', verifyToken,  getUserName);

export default router;