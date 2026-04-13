export interface IUser{
  id?: string;
  //Credenciales
  passwordEncrypt: string;
  //Datos personales
  nombre?: string;
  paterno?: string;
  materno?: string;
  numeroTelefono?: string;
  //Control de acceso
  tipoUsuario?: number;
  activo?: number;
  //Intentos de inicio de sesión
  intentosLogueo?: number;
  bloqueado?: number;
  //Fechas de creación y actualización
  ultimaActualizacion?: Date;
  fechaCreacion?: Date;
};