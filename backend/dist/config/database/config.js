"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const serviceAccountPath = path_1.default.join(__dirname, '../../../firebase-key.json');
//Carga las credenciales de Firebase desde el archivo JSON
const serviceAccount = JSON.parse((0, fs_1.readFileSync)(serviceAccountPath, 'utf8'));
console.log(serviceAccount.project_id);
console.log("Service account loaded:", serviceAccount.client_email);
//Inicializa la aplicación de Firebase con las credenciales
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});
console.log("Project:", firebase_admin_1.default.app().options.projectId);
const db = firebase_admin_1.default.firestore();
exports.default = db;
