import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Application } from 'express';
import db from '../../config/database/config';

import loginRoutesUser from '../../interfaces/routes/login.routes';
import registerRoutesUser from '../../interfaces/routes/register.routes';
import routesProduct from '../../interfaces/routes/products.routes';
import routeSales from '../../interfaces/routes/sales.routes'

// import userRouter from '../../interfaces/routes/delete.routes';
// import updateUser from '../../interfaces/routes/update.routes';
// import nameRouter from '../../interfaces/routes/navbar.routes'
// import permissionsRouter from '../../interfaces/routes/permissions.routes'

dotenv.config();

// Clase principal del servidor que configura y levanta la aplicación Express
class Server {
    private readonly app: Application;
    private readonly port: string;

    // En el constructor se inicializa la aplicación, se configuran los middlewares, las rutas, la conexión a la base de datos y se inicia el servidor
    constructor() {
        this.app = express();
        this.port = process.env['PORT'] ?? '3000';

        this.middlewares();
        this.routes();
        this.dbConnect();
        this.listen();
    }

    // Método para iniciar el servidor y escuchar en el puerto configurado
    private listen() {
        this.app.listen(this.port, () => {
            console.log(`Aplicación corriendo en el puerto ${this.port}`);
        });
    }

    // Método para configurar las rutas de la aplicación, incluyendo rutas de autenticación, gestión de usuarios y permisos
    private routes() {
        this.app.use('/api/auth', loginRoutesUser);
        this.app.use('/api/auth', registerRoutesUser);
        this.app.use('/api/products', routesProduct);
        this.app.use('/api/sales', routeSales);
    }

    // Método para configurar los middlewares de la aplicación, incluyendo el middleware para parsear JSON y habilitar CORS
    private middlewares() {
        this.app.use(express.json());
        this.app.use(cors());
    }

    // Método para conectar a la base de datos y sincronizar los modelos definidos, asegurando que la estructura de la base de datos esté actualizada
    private async dbConnect() {
        try {
            await db.collection('test').get(); // Prueba de conexión a la base de datos
            console.log('Firebase conectado correctamente');
        } catch (error) {
            console.error('Error al conectar la base de datos:', error);
        }
    }
}

export default Server;