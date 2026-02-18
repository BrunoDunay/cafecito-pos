import { 
  AppError, 
  BadRequestError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError 
} from '../src/utils/errors.js';

describe('Errores personalizados', () => {
  test('AppError debe crear un error con mensaje y código de estado', () => {
    const error = new AppError('Error de prueba', 418);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Error de prueba');
    expect(error.statusCode).toBe(418);
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  test('BadRequestError debe tener código 400 y mensaje por defecto', () => {
    const error = new BadRequestError();
    
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Solicitud incorrecta');
    expect(error.statusCode).toBe(400);
  });

  test('BadRequestError debe aceptar mensaje personalizado', () => {
    const error = new BadRequestError('El email es inválido');
    
    expect(error.message).toBe('El email es inválido');
    expect(error.statusCode).toBe(400);
  });

  test('NotFoundError debe tener código 404 y mensaje por defecto', () => {
    const error = new NotFoundError();
    
    expect(error.message).toBe('Recurso no encontrado');
    expect(error.statusCode).toBe(404);
  });

  test('NotFoundError debe aceptar mensaje personalizado', () => {
    const error = new NotFoundError('Producto no encontrado');
    
    expect(error.message).toBe('Producto no encontrado');
    expect(error.statusCode).toBe(404);
  });

  test('UnauthorizedError debe tener código 401 y mensaje por defecto', () => {
    const error = new UnauthorizedError();
    
    expect(error.message).toBe('No autorizado');
    expect(error.statusCode).toBe(401);
  });

  test('UnauthorizedError debe aceptar mensaje personalizado', () => {
    const error = new UnauthorizedError('Token expirado');
    
    expect(error.message).toBe('Token expirado');
    expect(error.statusCode).toBe(401);
  });

  test('ForbiddenError debe tener código 403 y mensaje por defecto', () => {
    const error = new ForbiddenError();
    
    expect(error.message).toBe('Acceso prohibido');
    expect(error.statusCode).toBe(403);
  });

  test('ForbiddenError debe aceptar mensaje personalizado', () => {
    const error = new ForbiddenError('No tienes permisos de administrador');
    
    expect(error.message).toBe('No tienes permisos de administrador');
    expect(error.statusCode).toBe(403);
  });
});