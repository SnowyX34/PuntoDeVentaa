import { body } from 'express-validator';
export const validateCreateUser = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre inválido'),

  body('paterno')
    .trim()
    .notEmpty().withMessage('Apellido paterno obligatorio')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido paterno inválido'),

  body('materno')
    .trim()
    .optional()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido materno inválido'),

  body('numeroTelefono')
    .trim()
    .notEmpty().withMessage('Número de teléfono obligatorio')
    .isLength({ min: 10, max: 10 })
    .withMessage('Número de teléfono inválido'),

  body('tipoUsuario')
    .isInt({ min: 1 })
    .withMessage('Tipo de usuario inválido'),

  body('passwordEncrypt')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener mínimo 6 caracteres')
];


export const validateLogin = [
  body('id').isInt().withMessage("ID inválido"),
  body('passwordEncrypt').notEmpty().withMessage("Contraseña requerida")
];