"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config/database/config"));
const loginUser = async (req, res) => {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req);
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
        const docRef = config_1.default.collection('users').doc(id);
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
        if ((user === null || user === void 0 ? void 0 : user.bloqueado) === 1) {
            return res.status(403).json({
                msg: "Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos. Por favor, contacta al administrador."
            });
        }
        // Verificar contraseña
        const passwordValid = await bcryptjs_1.default.compare(passwordEncrypt, (user === null || user === void 0 ? void 0 : user.passwordEncrypt) || '');
        if (!passwordValid) {
            const nuevosIntentos = ((user === null || user === void 0 ? void 0 : user.intentosLogueo) || 0) + 1;
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
        const token = jsonwebtoken_1.default.sign({
            userId: doc.id,
            role: Number((user === null || user === void 0 ? void 0 : user.tipoUsuario) || 1),
            nombre: user === null || user === void 0 ? void 0 : user.nombre,
        }, (_a = process.env['SECRET_KEY']) !== null && _a !== void 0 ? _a : 'pacoeltaco', {
            expiresIn: '24h'
        });
        return res.json({ token });
    }
    catch (err) {
        console.error('Error en login:', err);
        return res.status(500).json({
            msg: "Algo ha ocurrido, contacte con el administrador"
        });
    }
};
exports.loginUser = loginUser;
