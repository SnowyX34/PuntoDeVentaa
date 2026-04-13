// backend/src/controllers/sale.controller.ts
import { Request, Response } from 'express';
import db from '../../config/database/config';
import { Sale, SaleItem } from '../../infrestructure/models/sales';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { CloudinaryService } from '../../infrestructure/services/cloudinary.service';

// Crear nueva venta
export const createSale = async (req: Request, res: Response) => {
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

      const productRef = db.collection('products').doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({
          message: `Producto no existe: ${item.productId}`
        });
      }

      const currentStock = productDoc.data()?.stock || 0;

      if (currentStock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${item.productId}`
        });
      }
    }

    const saleId = db.collection('sales').doc().id;

    const newSale: Sale = {
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

    await db.collection('sales').doc(saleId).set(newSale);

    for (const item of saleData.items) {
      const productRef = db.collection('products').doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) continue;

      const data = productDoc.data();
      const currentStock = data?.stock || 0;
      const newStock = currentStock - item.quantity;

      if (newStock <= 0) {
        if (data?.imageUrl) {
          const publicId = CloudinaryService.extractPublicId(data.imageUrl);
          if (publicId) {
            await CloudinaryService.deleteImage(publicId);
            console.log('Imagen eliminada de Cloudinary');
          }
        }

        await productRef.delete();

      } else {
        await productRef.update({ stock: newStock });
      }
    }

    res.status(201).json({
      message: 'Venta registrada correctamente',
      saleId
    });

  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      message: 'Error al registrar la venta'
    });
  }
};
// Obtener todas las ventas
export const getAllSales = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('sales')
            .orderBy('createdAt', 'desc')
            .get();

        const sales: Sale[] = [];
        snapshot.forEach(doc => {
            sales.push({ id: doc.id, ...doc.data() } as Sale);
        });

        res.json(sales);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};

// Obtener ventas por usuario
export const getSalesByUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const snapshot = await db.collection('sales')
            .where('userId', '==', userId)
            .get();

        const sales: Sale[] = [];
        snapshot.forEach(doc => {
            sales.push({ id: doc.id, ...doc.data() } as Sale);
        });

        res.json(sales);
    } catch (error) {
        console.error('Error al obtener ventas por usuario:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};

// Obtener venta por ID
export const getSaleById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const docRef = db.collection('sales').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ message: 'Error al obtener la venta' });
    }
};

// Actualizar estado de venta
export const updateSaleStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const docRef = db.collection('sales').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        await docRef.update({
            status: status,
            updatedAt: new Date()
        });

        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ message: 'Error al actualizar estado' });
    }
};

// Eliminar venta
export const deleteSale = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const docRef = db.collection('sales').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Restaurar stock si la venta estaba completada
        const saleData = doc.data();
        if (saleData?.status === 'completed') {
            for (const item of saleData.items) {
                const productRef = db.collection('products').doc(item.productId);
                const productDoc = await productRef.get();
                if (productDoc.exists) {
                    const currentStock = productDoc.data()?.stock || 0;
                    await productRef.update({ stock: currentStock + item.quantity });
                }
            }
        }

        await docRef.delete();
        res.json({ message: 'Venta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ message: 'Error al eliminar la venta' });
    }
};

// Obtener ventas con filtros
export const getSalesWithFilters = async (req: Request, res: Response) => {
    const { startDate, endDate, userId, status, minTotal, maxTotal } = req.query;

    try {
        let query: any = db.collection('sales');

        if (userId) {
            query = query.where('userId', '==', userId);
        }

        if (status) {
            query = query.where('status', '==', status);
        }

        if (startDate) {
            query = query.where('createdAt', '>=', new Date(startDate as string));
        }

        if (endDate) {
            query = query.where('createdAt', '<=', new Date(endDate as string));
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        let sales: Sale[] = [];
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
            const sale = { id: doc.id, ...doc.data() } as Sale;

            // Filtros adicionales (total)
            let include = true;
            if (minTotal && sale.total < Number(minTotal)) include = false;
            if (maxTotal && sale.total > Number(maxTotal)) include = false;

            if (include) {
                sales.push(sale);
            }
        });

        res.json(sales);
    } catch (error) {
        console.error('Error al filtrar ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};

// Obtener resumen de ventas
export const getSalesSummary = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    try {
        let query: any = db.collection('sales');

        if (startDate) {
            query = query.where('createdAt', '>=', new Date(startDate as string));
        }
        if (endDate) {
            query = query.where('createdAt', '<=', new Date(endDate as string));
        }

        const snapshot = await query.get();

        let totalSales = 0;
        let totalRevenue = 0;
        let completedSales = 0;
        let pendingSales = 0;

        snapshot.forEach((doc: QueryDocumentSnapshot) => {
            const sale = doc.data() as Sale;
            totalRevenue += sale.total;
            totalSales++;

            if (sale.status === 'completed') completedSales++;
            if (sale.status === 'pending') pendingSales++;
        });

        res.json({
            totalSales,
            totalRevenue,
            completedSales,
            pendingSales,
            averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0
        });
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ message: 'Error al obtener resumen' });
    }
};

export const searchSales = async (req: Request, res: Response) => {
    const { terms } = req.query;

    if (!terms || typeof terms !== 'string') {
        res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        return;
    }

    try {
        const snapshot = await db.collection('sales').get();
        const sales = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Sale, 'id'>)
            }))
            .filter(Sale =>
                Sale.items.some(item =>
                    Sale.userName.toLowerCase().includes(terms.toLowerCase())
                )
            );

        if (sales.length === 0) {
            res.status(404).json({ message: 'No se encontraron ventas con ese término' });
            return;
        }

        res.json(sales);
        return;
    } catch (error) {
        console.error('Error al buscar ventas:', error);
        res.status(500).json({
            message: 'Error al buscar ventas',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
        return;
    }
};