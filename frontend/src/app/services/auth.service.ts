import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'devpulse_token';

  // Angular 17 signal for reactive auth state
  isLoggedIn = signal<boolean>(false);

  constructor(private api: ApiService, private router: Router) {
    this.isLoggedIn.set(!!localStorage.getItem(this.TOKEN_KEY));
  }

  login(password: string) {
    return this.api.login({ password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string {
    return localStorage.getItem(this.TOKEN_KEY) || '';
  }
}
