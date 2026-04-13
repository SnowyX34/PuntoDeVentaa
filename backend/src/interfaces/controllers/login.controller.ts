import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../../config/database/config';

export const loginUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: "Datos inválidos", errors: errors.array() });
    }
    
    const { id, passwordEncrypt } = req.body;
    
    // VALIDACIÓN CRÍTICA: Verificar que el ID sea válido ANTES de usarlo
    if (!id || typeof id !== 'string' || id.trim() === '') {
        console.log("ID inválido recibido:", id);
        return res.status(400).json({
            msg: `Ha ocurrido un problema, vuelve a intentar`
        });
    }

    try {
        // Ahora es seguro usar id porque sabemos que es un string no vacío
        const docRef = db.collection('users').doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            console.log("Usuario no encontrado:", id);
            
            // Importante: NO intentar acceder a doc.data() cuando no existe
            // Simplemente devolvemos el error
            return res.status(400).json({
                msg: `Ha ocurrido un problema, vuelve a intentar`
            });
        }

        const user = doc.data();
        
        // Verificar si el usuario está bloqueado
        if (user?.bloqueado === 1) {
            return res.status(403).json({
                msg: "Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos. Por favor, contacta al administrador."
            });
        }
        
        // Verificar contraseña
        const passwordValid = await bcrypt.compare(passwordEncrypt, user?.passwordEncrypt || '');

        if (!passwordValid) {
            const nuevosIntentos = (user?.intentosLogueo || 0) + 1;

            // Actualizar intentos solo si el usuario existe
            await docRef.update({
                intentosLogueo: nuevosIntentos,
                bloqueado: nuevosIntentos >= 5 ? 1 : 0
            });

            return res.status(400).json({
                msg: "Ha ocurrido un problema, vuelve a intentar",
                intentos: nuevosIntentos
            });
        }

        // Restablecer intentos
        await docRef.update({
            intentosLogueo: 0,
        });

        // Generar token
        const token = jwt.sign(
            {
                userId: doc.id,
                role: Number(user?.tipoUsuario || 1),
                nombre: user?.nombre,
            },
            process.env['SECRET_KEY'] ?? 'pacoeltaco',
            {
                expiresIn: '24h'
            }
        );

        return res.json({ token });
        
    } catch (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ 
            msg: "Algo ha ocurrido, contacte con el administrador" 
        });
    }
};