"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config/database/config"));
// Controlador para manejar el proceso de registro de un nuevo usuario, validando los datos de entrada, hasheando la contraseña y creando un nuevo registro en la base de datos
const registerUser = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    // Se extraen los campos necesarios del cuerpo de la solicitud, que son requeridos para el proceso de registro de un nuevo usuario
    const { passwordEncrypt, nombre, paterno, materno, numeroTelefono, tipoUsuario, } = req.body;
    // Validar campos obligatorios
    if (!passwordEncrypt ||
        !nombre ||
        !paterno ||
        !materno ||
        !numeroTelefono ||
        tipoUsuario === undefined) {
        res.status(400).json({ msg: "Todos los campos son obligatorios" });
        return;
    }
    try {
        // Hashear la contraseña    
        const hashedPassword = await bcryptjs_1.default.hash(passwordEncrypt, 10);
        // Crear el usuario
        const newUser = {
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
            fechaCreacion: new Date()
        };
        await config_1.default.collection('users').add(newUser);
        res.status(201).json({
            msg: `Usuario ${nombre} creado exitosamente`,
        });
    }
    catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            msg: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.registerUser = registerUser;
