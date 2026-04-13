"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserName = void 0;
const config_1 = __importDefault(require("../../config/database/config"));
// Controlador para obtener el nombre y tipo de usuario desde Firestore
// backend/src/controllers/navbar.controller.ts
const getUserName = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }
    try {
        const userDoc = await config_1.default.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const userData = userDoc.data();
        res.json({
            nombre: (userData === null || userData === void 0 ? void 0 : userData.nombre) || (userData === null || userData === void 0 ? void 0 : userData.name) || 'Usuario',
            tipoUsuario: (userData === null || userData === void 0 ? void 0 : userData.tipoUsuario) || (userData === null || userData === void 0 ? void 0 : userData.role) || 1
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener información' });
        return;
    }
};
exports.getUserName = getUserName;
