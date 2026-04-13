import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Se definen interfaces para el payload del token JWT y para la solicitud de autenticación, que incluye un campo opcional 'user' que contiene la información del usuario autenticado
interface JwtPayload {
  userId: number;
  role: number;
}

// Se define una interfaz AuthRequest que extiende la interfaz Request de Express, agregando un campo opcional 'user' que contiene la información del usuario autenticado, lo que permite acceder a esta información en los controladores protegidos por el middleware de autenticación
interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware para verificar si el usuario autenticado tiene permisos de administrador, verificando el token JWT en la cabecera de autorización y comprobando el rol del usuario decodificado. Si el usuario no tiene permisos de administrador, se devuelve un error 403 indicando que el acceso está denegado
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Se verifica si la cabecera de autorización está presente y si comienza con 'Bearer '. Si no se cumple esta condición, se devuelve un error 401 indicando que ha ocurrido un error de autenticación
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Ha ocurrido un errorsllo' });
    return;
  }

  // Se extrae el token JWT de la cabecera de autorización, separando la cadena por espacios y tomando la segunda parte (el token propiamente dicho)
  const token = authHeader.split(' ')[1];

  // Se intenta verificar el token JWT utilizando la clave secreta definida en las variables de entorno (o una clave por defecto si no está definida). Si la verificación es exitosa, se decodifica el token y se comprueba el rol del usuario. Si el rol no es 1 (administrador) ni 2 (superadministrador), se devuelve un error 403 indicando que el acceso está denegado. Si la verificación falla, se devuelve un error 401 indicando que ha ocurrido un error de autenticación
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'pacoeltaco') as JwtPayload;

    if (decoded.role !== 1 && decoded.role !== 2) {
      res.status(403).json({ message: 'Acceso denegadote.'});
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Ocurrio un errorsito' });
    return;
  }
};