import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { addProduct, updateProduct, deleteProduct, getAllProducts, searchProducts, getProuctById } from '../controllers/product.controller';
import { verifyAdmin } from '../middleware/authAdmin';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/add', verifyAdmin, upload.single('image'), addProduct);
router.put('/:id', verifyAdmin, upload.single('image'), updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);
router.get('/search', searchProducts);
router.get('/', getAllProducts);
router.get('/getProduct/:id', getProuctById)


export default router;
