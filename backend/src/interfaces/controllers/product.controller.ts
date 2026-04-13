import { Request, Response } from 'express';
import { Product, UpdateProductBody } from '../../infrestructure/models/products';
import { CloudinaryService } from '../../infrestructure/services/cloudinary.service';
import db from '../../config/database/config';

export const addProduct = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    const {
        modelo,
        color,
        price,
        size,
        stock,
        imageUrl,
        category,
        brand,
        description
    } = req.body;

if (!modelo || !price || !category || !brand) {
    res.status(400).json({ message: 'Faltan datos' });
    return;
}

try {
    let image_url_to_save = 'https://via.placeholder.com/400x300/cccccc/666666?text=Sin+Imagen';

    if (req.file) {
        const uploadResult = await CloudinaryService.uploadImage(
            req.file.buffer,
            req.file.originalname, 'products'
        );

        image_url_to_save = uploadResult.secure_url;

    } else if (imageUrl) {
        image_url_to_save = imageUrl;
    }

    const newProduct = await db.collection(`products`).add({
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
} catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({
        message: 'Error al agregar producto',
        error: error instanceof Error ? error.message : 'Error desconocido'
    });
    return;
}
};

export const updateProduct = async (
    req: Request & { file?: Express.Multer.File },
    res: Response) => {

    const { id } = req.params;

    try {
        const product = await db.collection('products').doc(id);
        const doc = await product.get();

        if (!doc.exists) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }

        const data = doc.data();

        let updateData: any = {
            ...req.body
        };

        if (req.file) {
            // Eliminar imagen previa si existe y está en Cloudinary
            if (data?.imageUrl) {
                const publicId = CloudinaryService.extractPublicId(data.imageUrl);
                if (publicId) {
                    try {
                        await CloudinaryService.deleteImage(publicId);
                        console.log('Imagen anterior eliminada de Cloudinary');
                    } catch (error) {
                        console.warn('No se pudo eliminar la imagen anterior:', error);
                    }
                }
            }
            const uploadResult = await CloudinaryService.uploadImage(
                req.file.buffer,
                req.file.originalname,
                'products');

            updateData.imageUrl = uploadResult.secure_url;
        }

        await product.update(updateData);

        res.json({
            message: 'Producto actualizado',
            product
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            message: 'Error al actualizar producto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('products').get();

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

// Función para buscar productos por término
export const searchProducts = async (req: Request, res: Response) => {
    const { term } = req.query;

    if (!term || typeof term !== 'string') {
        res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        return;
    }

    try {
        const snapshot = await db.collection('products').get();
        const products = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Product, 'id'>)
            }))
            .filter(product =>
                product.modelo.toLowerCase().includes(term.toLowerCase()) ||
                (product.category && product.category.toLowerCase().includes(term.toLowerCase())) ||
                (product.brand && product.brand.toLowerCase().includes(term.toLowerCase()))
            );

        if (products.length === 0) {
            res.status(404).json({ message: 'No se encontraron productos con ese término' });
            return;
        }

        res.json(products);
        return;
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({
            message: 'Error al buscar productos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    try {
        const product = db.collection('products').doc(id);
        const doc = await product.get();


        if (!doc.exists) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }

        const data = doc.data();

        // Si tiene imagen en Cloudinary, eliminarla
        if (data?.imageUrl) {
            const publicId = CloudinaryService.extractPublicId(data.imageUrl);
            if (publicId) {
                await CloudinaryService.deleteImage(publicId);
                console.log('Imagen eliminada de Cloudinary');
            }
        }

        await product.delete();

        res.json({
            message: 'Producto eliminado correctamente'
        });
        return;

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            message: 'Error al eliminar producto',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};

    export const getProuctById = async (req:Request,res:Response)=>{
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'ID del producto no proporcionado' });
    }

    try {
        const productDoc = await db.collection('products').doc(id).get();
        
        if (!productDoc.exists) {
        return res.status(404).json({ message: 'Producto no encontrado' });
        }
        const product = productDoc.data();
        
        res.json({
        id : productDoc.id,
        ...product
        });
        return;
        
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener información' });
        return;
    }
    };
