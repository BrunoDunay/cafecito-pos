import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<'admin' | 'seller'>;
  const userRole = authService.getRole();

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
