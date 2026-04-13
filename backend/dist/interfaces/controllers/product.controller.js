"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProuctById = exports.deleteProduct = exports.searchProducts = exports.getAllProducts = exports.updateProduct = exports.addProduct = void 0;
const cloudinary_service_1 = require("../../infrestructure/services/cloudinary.service");
const config_1 = __importDefault(require("../../config/database/config"));
const addProduct = async (req, res) => {
    const { modelo, color, price, size, stock, imageUrl, category, brand, description } = req.body;
    if (!modelo || !price || !category || !brand) {
        res.status(400).json({ message: 'Faltan datos' });
        return;
    }
    try {
        let image_url_to_save = 'https://via.placeholder.com/400x300/cccccc/666666?text=Sin+Imagen';
        if (req.file) {
            const uploadResult = await cloudinary_service_1.CloudinaryService.uploadImage(req.file.buffer, req.file.originalname, 'products');
            image_url_to_save = uploadResult.secure_url;
        }
        else if (imageUrl) {
            image_url_to_save = imageUrl;
        }
        const newProduct = await config_1.default.collection(`products`).add({
            modelo,
            color,
            price,
            size,
            stock,
            imageUrl: image_url_to_save,
            category,
            brand,
            description,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        res.status(201).json({
            message: 'Producto agregado',
            product: newProduct
        });
        return;
    }
    catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({
            message: 'Error al agregar producto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};
exports.addProduct = addProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await config_1.default.collection('products').doc(id);
        const doc = await product.get();
        if (!doc.exists) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        const data = doc.data();
        let updateData = {
            ...req.body
        };
        if (req.file) {
            // Eliminar imagen previa si existe y está en Cloudinary
            if (data === null || data === void 0 ? void 0 : data.imageUrl) {
                const publicId = cloudinary_service_1.CloudinaryService.extractPublicId(data.imageUrl);
                if (publicId) {
                    try {
                        await cloudinary_service_1.CloudinaryService.deleteImage(publicId);
                        console.log('Imagen anterior eliminada de Cloudinary');
                    }
                    catch (error) {
                        console.warn('No se pudo eliminar la imagen anterior:', error);
                    }
                }
            }
            const uploadResult = await cloudinary_service_1.CloudinaryService.uploadImage(req.file.buffer, req.file.originalname, 'products');
            updateData.imageUrl = uploadResult.secure_url;
        }
        await product.update(updateData);
        res.json({
            message: 'Producto actualizado',
            product
        });
    }
    catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            message: 'Error al actualizar producto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};
exports.updateProduct = updateProduct;
const getAllProducts = async (req, res) => {
    try {
        const snapshot = await config_1.default.collection('products').get();
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(products);
    }
    catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            message: 'Error al obtener productos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};
exports.getAllProducts = getAllProducts;
// Función para buscar productos por término
const searchProducts = async (req, res) => {
    const { term } = req.query;
    if (!term || typeof term !== 'string') {
        res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        return;
    }
    try {
        const snapshot = await config_1.default.collection('products').get();
        const products = snapshot.docs
            .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
            .filter(product => product.modelo.toLowerCase().includes(term.toLowerCase()) ||
            (product.category && product.category.toLowerCase().includes(term.toLowerCase())) ||
            (product.brand && product.brand.toLowerCase().includes(term.toLowerCase())));
        if (products.length === 0) {
            res.status(404).json({ message: 'No se encontraron productos con ese término' });
            return;
        }
        res.json(products);
        return;
    }
    catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({
            message: 'Error al buscar productos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};
exports.searchProducts = searchProducts;
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = config_1.default.collection('products').doc(id);
        const doc = await product.get();
        if (!doc.exists) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        const data = doc.data();
        // Si tiene imagen en Cloudinary, eliminarla
        if (data === null || data === void 0 ? void 0 : data.imageUrl) {
            const publicId = cloudinary_service_1.CloudinaryService.extractPublicId(data.imageUrl);
            if (publicId) {
                await cloudinary_service_1.CloudinaryService.deleteImage(publicId);
                console.log('Imagen eliminada de Cloudinary');
            }
        }
        await product.delete();
        res.json({
            message: 'Producto eliminado correctamente'
        });
        return;
    }
    catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            message: 'Error al eliminar producto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};
exports.deleteProduct = deleteProduct;
const getProuctById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'ID del producto no proporcionado' });
    }
    try {
        const productDoc = await config_1.default.collection('products').doc(id).get();
        if (!productDoc.exists) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        const product = productDoc.data();
        res.json({
            id: productDoc.id,
            ...product
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener información' });
        return;
    }
};
exports.getProuctById = getProuctById;
