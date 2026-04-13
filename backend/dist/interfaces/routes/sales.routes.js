"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/sale.routes.ts
const express_1 = require("express");
const sales_controller_1 = require("../controllers/sales.controller");
const authAdmin_1 = require("../middleware/authAdmin");
const router = (0, express_1.Router)();
// Rutas públicas (con token)
router.post('/', authAdmin_1.verifyAdmin, sales_controller_1.createSale);
router.get('/user/:userId', authAdmin_1.verifyAdmin, sales_controller_1.getSalesByUser);
router.get('/searchSale', sales_controller_1.searchSales);
router.get('/:id', authAdmin_1.verifyAdmin, sales_controller_1.getSaleById);
// Rutas de admin
router.get('/', authAdmin_1.verifyAdmin, sales_controller_1.getAllSales);
router.get('/filter/list', authAdmin_1.verifyAdmin, sales_controller_1.getSalesWithFilters);
router.get('/summary/report', authAdmin_1.verifyAdmin, sales_controller_1.getSalesSummary);
router.patch('/:id/status', authAdmin_1.verifyAdmin, sales_controller_1.updateSaleStatus);
router.delete('/:id', authAdmin_1.verifyAdmin, sales_controller_1.deleteSale);
exports.default = router;
