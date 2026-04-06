import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  // Redirect to login, preserving the URL they wanted to visit
  router.navigate(['/login'], {
    queryParams: { returnUrl: route.url.map(s => s.path).join('/') }
  });
  return false;
};
