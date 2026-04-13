import { Router } from 'express';
import { registerUser } from '../controllers/register.controller';
import { validateCreateUser } from '../middleware/validateUser';

const router = Router();
router.post('/register', validateCreateUser,registerUser);
export default router;