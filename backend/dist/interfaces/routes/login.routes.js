"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_controller_1 = require("../controllers/login.controller");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/login', [
    (0, express_validator_1.body)('id').notEmpty().withMessage("ID inválido"),
    (0, express_validator_1.body)('passwordEncrypt').notEmpty().withMessage("Contraseña requerida")
], login_controller_1.loginUser);
exports.default = router;
