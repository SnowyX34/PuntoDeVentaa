"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateCreateUser = void 0;
const express_validator_1 = require("express-validator");
exports.validateCreateUser = [
    (0, express_validator_1.body)('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Nombre inválido'),
    (0, express_validator_1.body)('paterno')
        .trim()
        .notEmpty().withMessage('Apellido paterno obligatorio')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Apellido paterno inválido'),
    (0, express_validator_1.body)('materno')
        .trim()
        .optional()
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Apellido materno inválido'),
    (0, express_validator_1.body)('numeroTelefono')
        .trim()
        .notEmpty().withMessage('Número de teléfono obligatorio')
        .isLength({ min: 10, max: 10 })
        .withMessage('Número de teléfono inválido'),
    (0, express_validator_1.body)('tipoUsuario')
        .isInt({ min: 1 })
        .withMessage('Tipo de usuario inválido'),
    (0, express_validator_1.body)('passwordEncrypt')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener mínimo 6 caracteres')
];
exports.validateLogin = [
    (0, express_validator_1.body)('id').isInt().withMessage("ID inválido"),
    (0, express_validator_1.body)('passwordEncrypt').notEmpty().withMessage("Contraseña requerida")
];
