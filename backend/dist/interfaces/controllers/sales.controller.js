"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSales = exports.getSalesSummary = exports.getSalesWithFilters = exports.deleteSale = exports.updateSaleStatus = exports.getSaleById = exports.getSalesByUser = exports.getAllSales = exports.createSale = void 0;
const config_1 = __importDefault(require("../../config/database/config"));
const cloudinary_service_1 = require("../../infrestructure/services/cloudinary.service");
// Crear nueva venta
const createSale = async (req, res) => {
    var _a;
    const saleData = req.body;
    if (!saleData.userId || !saleData.items || saleData.items.length === 0) {
        return res.status(400).json({
            message: 'Datos incompletos: userId o items faltantes'
        });
    }
    try {
        for (const item of saleData.items) {
            if (!item.productId) {
                return res.status(400).json({
                    message: 'Item sin productId'
                });
            }
            const productRef = config_1.default.collection('products').doc(item.productId);
            const productDoc = await productRef.get();
            if (!productDoc.exists) {
                return res.status(404).json({
                    message: `Producto no existe: ${item.productId}`
                });
            }
            const currentStock = ((_a = productDoc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
            if (currentStock < item.quantity) {
                return res.status(400).json({
                    message: `Stock insuficiente para ${item.productId}`
                });
            }
        }
        const saleId = config_1.default.collection('sales').doc().id;
        const newSale = {
            userId: saleData.userId,
            userName: saleData.userName,
            userPhone: saleData.userPhone,
            items: saleData.items,
            total: saleData.total,
            status: saleData.status || 'pending',
            paymentMethod: saleData.paymentMethod,
            paymentStatus: saleData.paymentStatus || 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await config_1.default.collection('sales').doc(saleId).set(newSale);
        for (const item of saleData.items) {
            const productRef = config_1.default.collection('products').doc(item.productId);
            const productDoc = await productRef.get();
            if (!productDoc.exists)
                continue;
            const data = productDoc.data();
            const currentStock = (data === null || data === void 0 ? void 0 : data.stock) || 0;
            const newStock = currentStock - item.quantity;
            if (newStock <= 0) {
                if (data === null || data === void 0 ? void 0 : data.imageUrl) {
                    const publicId = cloudinary_service_1.CloudinaryService.extractPublicId(data.imageUrl);
                    if (publicId) {
                        await cloudinary_service_1.CloudinaryService.deleteImage(publicId);
                        console.log('Imagen eliminada de Cloudinary');
                    }
                }
                await productRef.delete();
            }
            else {
                await productRef.update({ stock: newStock });
            }
        }
        res.status(201).json({
            message: 'Venta registrada correctamente',
            saleId
        });
    }
    catch (error) {
        console.error('Error al crear venta:', error);
        res.status(500).json({
            message: 'Error al registrar la venta'
        });
    }
};
exports.createSale = createSale;
// Obtener todas las ventas
const getAllSales = async (req, res) => {
    try {
        const snapshot = await config_1.default.collection('sales')
            .orderBy('createdAt', 'desc')
            .get();
        const sales = [];
        snapshot.forEach(doc => {
            sales.push({ id: doc.id, ...doc.data() });
        });
        res.json(sales);
    }
    catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};
exports.getAllSales = getAllSales;
// Obtener ventas por usuario
const getSalesByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const snapshot = await config_1.default.collection('sales')
            .where('userId', '==', userId)
            .get();
        const sales = [];
        snapshot.forEach(doc => {
            sales.push({ id: doc.id, ...doc.data() });
        });
        res.json(sales);
    }
    catch (error) {
        console.error('Error al obtener ventas por usuario:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};
exports.getSalesByUser = getSalesByUser;
// Obtener venta por ID
const getSaleById = async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = config_1.default.collection('sales').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ message: 'Error al obtener la venta' });
    }
};
exports.getSaleById = getSaleById;
// Actualizar estado de venta
const updateSaleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const docRef = config_1.default.collection('sales').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        await docRef.update({
            status: status,
            updatedAt: new Date()
        });
        res.json({ message: 'Estado actualizado correctamente' });
    }
    catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ message: 'Error al actualizar estado' });
    }
};
exports.updateSaleStatus = updateSaleStatus;
// Eliminar venta
const deleteSale = async (req, res) => {
    var _a;
    const { id } = req.params;
    try {
        const docRef = config_1.default.collection('sales').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        // Restaurar stock si la venta estaba completada
        const saleData = doc.data();
        if ((saleData === null || saleData === void 0 ? void 0 : saleData.status) === 'completed') {
            for (const item of saleData.items) {
                const productRef = config_1.default.collection('products').doc(item.productId);
                const productDoc = await productRef.get();
                if (productDoc.exists) {
                    const currentStock = ((_a = productDoc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
                    await productRef.update({ stock: currentStock + item.quantity });
                }
            }
        }
        await docRef.delete();
        res.json({ message: 'Venta eliminada correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ message: 'Error al eliminar la venta' });
    }
};
exports.deleteSale = deleteSale;
// Obtener ventas con filtros
const getSalesWithFilters = async (req, res) => {
    const { startDate, endDate, userId, status, minTotal, maxTotal } = req.query;
    try {
        let query = config_1.default.collection('sales');
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        if (status) {
            query = query.where('status', '==', status);
        }
        if (startDate) {
            query = query.where('createdAt', '>=', new Date(startDate));
        }
        if (endDate) {
            query = query.where('createdAt', '<=', new Date(endDate));
        }
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        let sales = [];
        snapshot.forEach((doc) => {
            const sale = { id: doc.id, ...doc.data() };
            // Filtros adicionales (total)
            let include = true;
            if (minTotal && sale.total < Number(minTotal))
                include = false;
            if (maxTotal && sale.total > Number(maxTotal))
                include = false;
            if (include) {
                sales.push(sale);
            }
        });
        res.json(sales);
    }
    catch (error) {
        console.error('Error al filtrar ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};
exports.getSalesWithFilters = getSalesWithFilters;
// Obtener resumen de ventas
const getSalesSummary = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        let query = config_1.default.collection('sales');
        if (startDate) {
            query = query.where('createdAt', '>=', new Date(startDate));
        }
        if (endDate) {
            query = query.where('createdAt', '<=', new Date(endDate));
        }
        const snapshot = await query.get();
        let totalSales = 0;
        let totalRevenue = 0;
        let completedSales = 0;
        let pendingSales = 0;
        snapshot.forEach((doc) => {
            const sale = doc.data();
            totalRevenue += sale.total;
            totalSales++;
            if (sale.status === 'completed')
                completedSales++;
            if (sale.status === 'pending')
                pendingSales++;
        });
        res.json({
            totalSales,
            totalRevenue,
            completedSales,
            pendingSales,
            averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0
        });
    }
    catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ message: 'Error al obtener resumen' });
    }
};
exports.getSalesSummary = getSalesSummary;
const searchSales = async (req, res) => {
    const { terms } = req.query;
    if (!terms || typeof terms !== 'string') {
        res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        return;
    }
    try {
        const snapshot = await config_1.default.collection('sales').get();
        const sales = snapshot.docs
            .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
            .filter(Sale => Sale.items.some(item => Sale.userName.toLowerCase().includes(terms.toLowerCase())));
        if (sales.length === 0) {
            res.status(404).json({ message: 'No se encontraron ventas con ese término' });
            return;
        }
        res.json(sales);
        return;
    }
    catch (error) {
        console.error('Error al buscar ventas:', error);
        res.status(500).json({
            message: 'Error al buscar ventas',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};
exports.searchSales = searchSales;
