import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Función para convertir snake_case a camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      // Convierte snake_case a camelCase: user_id → userId
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Función para convertir camelCase a snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      // Convierte camelCase a snake_case: userId → user_id
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Interceptor principal
export const snakeCaseInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔵 [Interceptor] Request URL:', req.url);
  
  let modifiedReq = req;
  
  // Transformar body si existe
  if (req.body) {
    console.log('🔵 [Interceptor] Request body (original - camelCase):', req.body);
    const snakeBody = toSnakeCase(req.body);
    console.log('🔵 [Interceptor] Request body (transformed - snake_case):', snakeBody);
    modifiedReq = modifiedReq.clone({ body: snakeBody });
  }
  
  // Transformar query params si existen
  const params = req.params;
  if (params.keys().length > 0) {
    console.log('🔵 [Interceptor] Query params (original):', 
      Object.fromEntries(params.keys().map(k => [k, params.get(k)])));
    
    let newParams = params;
    let hasChanges = false;
    
    params.keys().forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (snakeKey !== key) {
        newParams = newParams.delete(key).set(snakeKey, params.get(key)!);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      modifiedReq = modifiedReq.clone({ params: newParams });
      console.log('🔵 [Interceptor] Query params (transformed):', 
        Object.fromEntries(newParams.keys().map(k => [k, newParams.get(k)])));
    }
  }
  
  return next(modifiedReq).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body) {
        console.log('🟢 [Interceptor] Response body (original - snake_case):', event.body);
        const camelBody = toCamelCase(event.body);
        console.log('🟢 [Interceptor] Response body (transformed - camelCase):', camelBody);
        return event.clone({ body: camelBody });
      }
      return event;
    })
  );
};