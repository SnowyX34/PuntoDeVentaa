"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("../../config/database/config"));
const login_routes_1 = __importDefault(require("../../interfaces/routes/login.routes"));
const register_routes_1 = __importDefault(require("../../interfaces/routes/register.routes"));
const products_routes_1 = __importDefault(require("../../interfaces/routes/products.routes"));
const sales_routes_1 = __importDefault(require("../../interfaces/routes/sales.routes"));
// import userRouter from '../../interfaces/routes/delete.routes';
// import updateUser from '../../interfaces/routes/update.routes';
// import nameRouter from '../../interfaces/routes/navbar.routes'
// import permissionsRouter from '../../interfaces/routes/permissions.routes'
dotenv_1.default.config();
// Clase principal del servidor que configura y levanta la aplicación Express
class Server {
    // En el constructor se inicializa la aplicación, se configuran los middlewares, las rutas, la conexión a la base de datos y se inicia el servidor
    constructor() {
        var _a;
        this.app = (0, express_1.default)();
        this.port = (_a = process.env['PORT']) !== null && _a !== void 0 ? _a : '3000';
        this.middlewares();
        this.routes();
        this.dbConnect();
        this.listen();
    }
    // Método para iniciar el servidor y escuchar en el puerto configurado
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Aplicación corriendo en el puerto ${this.port}`);
        });
    }
    // Método para configurar las rutas de la aplicación, incluyendo rutas de autenticación, gestión de usuarios y permisos
    routes() {
        this.app.use('/api/auth', login_routes_1.default);
        this.app.use('/api/auth', register_routes_1.default);
        this.app.use('/api/products', products_routes_1.default);
        this.app.use('/api/sales', sales_routes_1.default);
    }
    // Método para configurar los middlewares de la aplicación, incluyendo el middleware para parsear JSON y habilitar CORS
    middlewares() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
    }
    // Método para conectar a la base de datos y sincronizar los modelos definidos, asegurando que la estructura de la base de datos esté actualizada
    async dbConnect() {
        try {
            await config_1.default.collection('test').get(); // Prueba de conexión a la base de datos
            console.log('Firebase conectado correctamente');
        }
        catch (error) {
            console.error('Error al conectar la base de datos:', error);
        }
    }
}
exports.default = Server;
