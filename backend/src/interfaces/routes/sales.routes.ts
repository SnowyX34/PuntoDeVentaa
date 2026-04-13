// backend/src/routes/sale.routes.ts
import { Router } from 'express';
import {
  createSale,
  getAllSales,
  getSalesByUser,
  getSaleById,
  updateSaleStatus,
  deleteSale,
  getSalesWithFilters,
  getSalesSummary,
  searchSales
} from '../controllers/sales.controller';
import { verifyToken } from '../middleware/verifyToken';
import { verifyAdmin } from '../middleware/authAdmin';

const router = Router();

// Rutas públicas (con token)
router.post('/', verifyAdmin, createSale);
router.get('/user/:userId', verifyAdmin, getSalesByUser);
router.get('/searchSale', searchSales);
router.get('/:id', verifyAdmin, getSaleById);


// Rutas de admin
router.get('/', verifyAdmin, getAllSales);
router.get('/filter/list', verifyAdmin, getSalesWithFilters);
router.get('/summary/report', verifyAdmin, getSalesSummary);
router.patch('/:id/status', verifyAdmin, updateSaleStatus);
router.delete('/:id', verifyAdmin, deleteSale);

export default router;