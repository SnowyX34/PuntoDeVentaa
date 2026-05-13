import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {IUser} from '../../infrestructure/models/users';
import bcrypt from 'bcryptjs';
import db from '../../config/database/config';

// Controlador para manejar el proceso de registro de un nuevo usuario, validando los datos de entrada, hasheando la contraseña y creando un nuevo registro en la base de datos
export const registerUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    // Se extraen los campos necesarios del cuerpo de la solicitud, que son requeridos para el proceso de registro de un nuevo usuario
    const {
        id,
        passwordEncrypt,
        nombre,
        paterno,
        materno,
        numeroTelefono,
        tipoUsuario,
    } = req.body;

    // Validar campos obligatorios
    if (
        !id ||
        !passwordEncrypt ||
        !nombre ||
        !paterno ||
        !materno ||
        !numeroTelefono ||
        tipoUsuario === undefined
    ) {
        res.status(400).json({ msg: "Todos los campos son obligatorios" });
        return;
    }

    try {

        // Hashear la contraseña    
        const hashedPassword = await bcrypt.hash(passwordEncrypt, 10);

        // Crear el usuario
        const newUser: IUser = {
            id,
            nombre,
            passwordEncrypt: hashedPassword,
            paterno,
            materno,
            numeroTelefono,
            tipoUsuario,
            activo: 1,
            intentosLogueo: 0,
            bloqueado: 0,
            ultimaActualizacion: new Date(),
            fechaCreacion : new Date()
        };

        await db.collection('users').add(newUser);
        res.status(201).json({
            msg: `Usuario ${nombre} creado exitosamente`,
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};