import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrap">
      <div class="card">

        <div class="card-header">
          <div class="logo">DevPulse</div>
          <h1>Welcome back</h1>
          <p>Sign in to write, like, and comment</p>
        </div>

        <div class="err-banner" *ngIf="errorMsg">
          <span>⚠ {{ errorMsg }}</span>
          <button (click)="errorMsg=''">✕</button>
        </div>

        <form (ngSubmit)="submit()" #loginForm="ngForm" novalidate>

          <div class="field">
            <label for="email">Email address</label>
            <input id="email"
                   type="email"
                   placeholder="you@example.com"
                   [(ngModel)]="email"
                   name="email"
                   required
                   email
                   #emailField="ngModel"
                   [class.invalid]="emailField.invalid && emailField.touched"
                   autocomplete="email">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="pw-wrap">
              <input id="password"
                     [type]="showPw ? 'text' : 'password'"
                     placeholder="Your password"
                     [(ngModel)]="password"
                     name="password"
                     required
                     #pwField="ngModel"
                     [class.invalid]="pwField.invalid && pwField.touched"
                     autocomplete="current-password">
              <button type="button" class="toggle-pw" (click)="showPw = !showPw">
                {{ showPw ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn"
                  [disabled]="loading || loginForm.invalid">
            <span *ngIf="!loading">Sign in →</span>
            <span *ngIf="loading" class="loading-row">
              <span class="spin"></span> Signing in…
            </span>
          </button>

        </form>

        <div class="divider"><span>New to DevPulse?</span></div>
        <a routerLink="/register" class="register-link">Create a free account</a>

      </div>
    </div>
  `,
  styles: [`
    .page-wrap { min-height: calc(100vh - 60px); display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
    .card { background: #1e1e1e; border: 1px solid rgba(255,255,255,.08); border-radius: 18px; padding: 2.5rem; width: 100%; max-width: 420px; }
    .card-header { text-align: center; margin-bottom: 2rem; }
    .logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #e8d5a3; margin-bottom: 1rem; }
    .card-header h1 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; margin-bottom: 8px; }
    .card-header p { font-size: 14px; color: #9e9991; }
    .err-banner { background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3); border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #f87171; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
    .err-banner button { background: none; border: none; color: #f87171; cursor: pointer; }
    .field { margin-bottom: 1.25rem; }
    .field label { display: block; font-size: 13px; font-weight: 500; color: #9e9991; margin-bottom: 6px; }
    .field input { width: 100%; background: #141414; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #f0ede8; font-family: 'DM Sans', sans-serif; font-size: 15px; padding: 10px 14px; outline: none; transition: border-color .15s; }
    .field input::placeholder { color: #6b6660; }
    .field input:focus { border-color: rgba(232,213,163,.5); }
    .field input.invalid { border-color: rgba(248,113,113,.5); }
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 42px; }
    .toggle-pw { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; color: #6b6660; }
    .submit-btn { width: 100%; background: #e8d5a3; color: #0d0d0d; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; padding: 12px; cursor: pointer; transition: all .15s; margin-top: 0.5rem; }
    .submit-btn:hover:not(:disabled) { background: #c4a96b; }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
    .loading-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .spin { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,.2); border-top-color: #0d0d0d; border-radius: 50%; animation: sp .7s linear infinite; }
    @keyframes sp { to { transform: rotate(360deg); } }
    .divider { text-align: center; margin: 1.5rem 0 1rem; position: relative; }
    .divider::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(255,255,255,.08); }
    .divider span { background: #1e1e1e; position: relative; padding: 0 12px; font-size: 13px; color: #6b6660; }
    .register-link { display: block; text-align: center; color: #e8d5a3; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px; border: 1px solid rgba(232,213,163,.25); border-radius: 10px; transition: all .15s; }
    .register-link:hover { background: rgba(232,213,163,.06); }
  `]
})
export class LoginComponent {
  email    = '';
  password = '';
  showPw   = false;
  loading  = false;
  errorMsg = '';

  constructor(
    private auth:   AuthService,
    private toast:  ToastService,
    private router: Router,
    private route:  ActivatedRoute
  ) {}

  submit() {
    if (!this.email || !this.password) return;
    this.loading  = true;
    this.errorMsg = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Welcome back! 👋');
        // Redirect to the page they came from, or home
        const ret = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(ret);
      },
      error: (e: Error) => {
        this.loading  = false;
        this.errorMsg = e.message || 'Incorrect email or password.';
      }
    });
  }
}
