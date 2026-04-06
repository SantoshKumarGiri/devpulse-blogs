import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'devpulse_token';
  private readonly USER_KEY  = 'devpulse_user';

  // Angular 17 signal for reactive auth state
  isLoggedIn   = signal<boolean>(false);
  currentUser  = signal<AuthUser | null>(null);

  constructor(private api: ApiService, private router: Router) {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user  = localStorage.getItem(this.USER_KEY);
    this.isLoggedIn.set(!!token);
    if (token && user) {
      try {
        this.currentUser.set(JSON.parse(user));
      } catch {
        this.currentUser.set(null);
      }
    }
  }

  login(payload: LoginRequest) {
    return this.api.login({ password: payload.password }).pipe(
      tap((res: AuthResponse) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const user: AuthUser = {
          id: 'admin',
          name: payload.email || 'Admin User',
          email: payload.email || 'admin@devpulse.local',
          role: 'ADMIN',
          avatarInitials: 'AD'
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      })
    );
  }

  register(payload: RegisterRequest) {
    return this.api.register(payload).pipe(
      tap((res: AuthResponse) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const user: AuthUser = {
          id: 'author',
          name: payload.name,
          email: payload.email,
          role: 'AUTHOR',
          avatarInitials: payload.name.split(' ').map(w => w[0].toUpperCase()).join('').slice(0,2)
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string {
    return localStorage.getItem(this.TOKEN_KEY) || '';
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  isAuthor(): boolean {
    return this.isLoggedIn() && this.currentUser() !== null;
  }

  getUserId(): string {
    return this.currentUser()?.id || '';
  }
}
