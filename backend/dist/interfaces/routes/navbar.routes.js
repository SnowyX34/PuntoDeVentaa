"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const navbar_controller_1 = require("../controllers/navbar.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
// Se define la ruta para obtener el nombre de un usuario específico, protegida por el middleware de verificación de token JWT para asegurar que solo los usuarios autenticados puedan acceder a esta información, llamando al controlador que maneja la lógica para recuperar el nombre del usuario a partir de su ID
router.get('/:userId', verifyToken_1.verifyToken, navbar_controller_1.getUserName);
exports.default = router;
