/*import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    if (token) {
      return true; // allow route
    } else {
      this.router.navigate(['/login']); // redirect to login
      return false;
    }
  }
}*/

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../features/auth/login/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  const token = authService.getToken();
  if (token) {
    return true; // allow route
  } else {
    return router.createUrlTree(['/login']); // redirect to login
  }
};
