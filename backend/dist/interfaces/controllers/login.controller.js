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
        const userInfo = await config_1.default
            .collection('users')
            .where('id', '==', id)
            .limit(1)
            .get();
        if (userInfo.empty) {
            console.log("Usuario no encontrado:", id);
            // Importante: NO intentar acceder a doc.data() cuando no existe
            // Simplemente devolvemos el error
            return res.status(400).json({
                msg: `Ha ocurrido un problema, vuelve a intentar`
            });
        }
        const user = userInfo.docs[0];
        const userData = user.data();
        // Verificar si el usuario está bloqueado
        if ((userData === null || userData === void 0 ? void 0 : userData.bloqueado) === 1) {
            return res.status(403).json({
                msg: "Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos. Por favor, contacta al administrador."
            });
        }
        // Verificar contraseña
        const passwordValid = await bcryptjs_1.default.compare(passwordEncrypt, (userData === null || userData === void 0 ? void 0 : userData.passwordEncrypt) || '');
        if (!passwordValid) {
            const nuevosIntentos = ((userData === null || userData === void 0 ? void 0 : userData.intentosLogueo) || 0) + 1;
            // Actualizar intentos solo si el usuario existe
            await user.ref.update({
                intentosLogueo: nuevosIntentos,
                bloqueado: nuevosIntentos >= 5 ? 1 : 0
            });
            return res.status(400).json({
                msg: "Ha ocurrido un problema, vuelve a intentar",
                intentos: nuevosIntentos
            });
        }
        // Restablecer intentos
        await user.ref.update({
            intentosLogueo: 0,
        });
        // Generar token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: Number((userData === null || userData === void 0 ? void 0 : userData.tipoUsuario) || 1),
            nombre: userData === null || userData === void 0 ? void 0 : userData.nombre,
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
