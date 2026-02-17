import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Convertir snake_case a camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_+([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      const finalKey = camelKey === 'Id' ? 'id' : camelKey;
      acc[finalKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

// Convertir camelCase a snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && obj !== undefined && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(
        /([A-Z])/g,
        (match) => `_${match.toLowerCase()}`
      );
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

export const snakeCaseInterceptor: HttpInterceptorFn = (req, next) => {
  let modifiedReq = req;

  // Transformar body de camelCase a snake_case
  if (req.body) {
    const snakeBody = toSnakeCase(req.body);
    modifiedReq = modifiedReq.clone({ body: snakeBody });
  }

  // Transformar query params de camelCase a snake_case
  const params = req.params;
  if (params.keys().length > 0) {
    let newParams = params;
    let hasChanges = false;

    params.keys().forEach((key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      if (snakeKey !== key) {
        newParams = newParams.delete(key).set(snakeKey, params.get(key)!);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      modifiedReq = modifiedReq.clone({ params: newParams });
    }
  }

  return next(modifiedReq).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body) {
        const transformedBody = toCamelCase(event.body);
        return event.clone({ body: transformedBody });
      }
      return event;
    }),
  );
};