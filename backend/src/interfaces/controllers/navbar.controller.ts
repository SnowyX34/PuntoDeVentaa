import { Request, Response } from 'express';
import db from '../../config/database/config';

// Controlador para obtener el nombre y tipo de usuario desde Firestore
// backend/src/controllers/navbar.controller.ts
export const getUserName = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'ID de usuario no proporcionado' });
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = userDoc.data();
    
    res.json({
      nombre: userData?.nombre || userData?.name || 'Usuario',
      tipoUsuario: userData?.tipoUsuario || userData?.role || 1
    });
    return;
    
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener información' });
    return;
  }
};