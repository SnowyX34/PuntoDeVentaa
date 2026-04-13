import { Router } from 'express';
import { loginUser } from '../controllers/login.controller';
import { validateLogin } from '../middleware/validateUser';
import { body } from 'express-validator';

const router = Router();
router.post('/login',[
    body('id').notEmpty().withMessage("ID inválido"),
    body('passwordEncrypt').notEmpty().withMessage("Contraseña requerida")
], loginUser);
export default router;