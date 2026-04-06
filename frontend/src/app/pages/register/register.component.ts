import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrap">
      <div class="card">

        <div class="card-header">
          <div class="logo">DevPulse</div>
          <h1>Create your account</h1>
          <p>Join the community — write and share DevOps knowledge</p>
        </div>

        <!-- Error banner -->
        <div class="err-banner" *ngIf="errorMsg">
          <span>⚠ {{ errorMsg }}</span>
          <button (click)="errorMsg=''">✕</button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" #regForm="ngForm" novalidate>

          <!-- Full name -->
          <div class="field">
            <label for="name">Full name</label>
            <input id="name"
                   type="text"
                   placeholder="Santosh Kumar Giri"
                   [(ngModel)]="form.name"
                   name="name"
                   required
                   minlength="2"
                   #nameField="ngModel"
                   [class.invalid]="nameField.invalid && nameField.touched"
                   autocomplete="name">
            <span class="field-err" *ngIf="nameField.invalid && nameField.touched">
              Please enter your full name (min 2 characters)
            </span>
          </div>

          <!-- Email -->
          <div class="field">
            <label for="email">Email address</label>
            <input id="email"
                   type="email"
                   placeholder="you@example.com"
                   [(ngModel)]="form.email"
                   name="email"
                   required
                   email
                   #emailField="ngModel"
                   [class.invalid]="emailField.invalid && emailField.touched"
                   autocomplete="email">
            <span class="field-err" *ngIf="emailField.invalid && emailField.touched">
              Please enter a valid email address
            </span>
          </div>

          <!-- Password -->
          <div class="field">
            <label for="password">Password</label>
            <div class="pw-wrap">
              <input id="password"
                     [type]="showPassword ? 'text' : 'password'"
                     placeholder="At least 6 characters"
                     [(ngModel)]="form.password"
                     name="password"
                     required
                     minlength="6"
                     #pwField="ngModel"
                     [class.invalid]="pwField.invalid && pwField.touched"
                     autocomplete="new-password">
              <button type="button" class="toggle-pw" (click)="showPassword = !showPassword"
                      [title]="showPassword ? 'Hide' : 'Show'">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="pw-strength" *ngIf="form.password">
              <div class="strength-bar">
                <div class="strength-fill"
                     [style.width.%]="passwordStrength.pct"
                     [class]="passwordStrength.cls"></div>
              </div>
              <span [class]="passwordStrength.cls">{{ passwordStrength.label }}</span>
            </div>
            <span class="field-err" *ngIf="pwField.invalid && pwField.touched">
              Password must be at least 6 characters
            </span>
          </div>

          <!-- Bio (optional) -->
          <div class="field">
            <label for="bio">
              Short bio
              <span class="optional">(optional)</span>
            </label>
            <textarea id="bio"
                      placeholder="DevOps engineer passionate about Kubernetes and CI/CD…"
                      [(ngModel)]="form.bio"
                      name="bio"
                      rows="2"
                      maxlength="200"
                      #bioField="ngModel"></textarea>
            <span class="char-count">{{ form.bio?.length || 0 }} / 200</span>
          </div>

          <!-- Submit -->
          <button type="submit"
                  class="submit-btn"
                  [disabled]="loading || regForm.invalid">
            <span *ngIf="!loading">Create account →</span>
            <span *ngIf="loading" class="loading-row">
              <span class="spin"></span> Creating account…
            </span>
          </button>

        </form>

        <!-- Divider -->
        <div class="divider"><span>Already have an account?</span></div>

        <!-- Sign in link -->
        <a routerLink="/login" class="signin-link">Sign in instead</a>

        <!-- Terms note -->
        <p class="terms">
          By creating an account you agree to write helpful, respectful content.
          No spam, no plagiarism.
        </p>

      </div>
    </div>
  `,
  styles: [`
    .page-wrap {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .card {
      background: #1e1e1e;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 18px;
      padding: 2.5rem;
      width: 100%;
      max-width: 460px;
    }
    .card-header { text-align: center; margin-bottom: 2rem; }
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 900;
      color: #e8d5a3;
      margin-bottom: 1rem;
    }
    .card-header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .card-header p { font-size: 14px; color: #9e9991; }

    /* Error banner */
    .err-banner {
      background: rgba(248,113,113,.1);
      border: 1px solid rgba(248,113,113,.3);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #f87171;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .err-banner button {
      background: none;
      border: none;
      color: #f87171;
      cursor: pointer;
      font-size: 14px;
    }

    /* Fields */
    .field { margin-bottom: 1.25rem; }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #9e9991;
      margin-bottom: 6px;
    }
    .optional { font-weight: 400; color: #6b6660; margin-left: 4px; }
    .field input,
    .field textarea {
      width: 100%;
      background: #141414;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      color: #f0ede8;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      padding: 10px 14px;
      outline: none;
      transition: border-color .15s;
      resize: vertical;
    }
    .field input::placeholder,
    .field textarea::placeholder { color: #6b6660; }
    .field input:focus,
    .field textarea:focus { border-color: rgba(232,213,163,.5); }
    .field input.invalid { border-color: rgba(248,113,113,.5); }
    .field-err { display: block; font-size: 12px; color: #f87171; margin-top: 5px; }
    .char-count { display: block; font-size: 11px; color: #6b6660; text-align: right; margin-top: 4px; }

    /* Password toggle */
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 42px; }
    .toggle-pw {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      color: #6b6660;
    }

    /* Password strength */
    .pw-strength { margin-top: 6px; display: flex; align-items: center; gap: 10px; }
    .strength-bar { flex: 1; height: 3px; background: rgba(255,255,255,.08); border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width .3s, background .3s; }
    .strength-fill.weak   { background: #f87171; }
    .strength-fill.medium { background: #f59e0b; }
    .strength-fill.strong { background: #4ade80; }
    .weak   { color: #f87171; font-size: 11px; }
    .medium { color: #f59e0b; font-size: 11px; }
    .strong { color: #4ade80; font-size: 11px; }

    /* Submit */
    .submit-btn {
      width: 100%;
      background: #e8d5a3;
      color: #0d0d0d;
      border: none;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      padding: 12px;
      cursor: pointer;
      transition: all .15s;
      margin-top: 0.5rem;
    }
    .submit-btn:hover:not(:disabled) { background: #c4a96b; }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
    .loading-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .spin {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,.2);
      border-top-color: #0d0d0d;
      border-radius: 50%;
      animation: sp .7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes sp { to { transform: rotate(360deg); } }

    /* Bottom links */
    .divider {
      text-align: center;
      margin: 1.5rem 0 1rem;
      position: relative;
    }
    .divider::before {
      content: '';
      position: absolute;
      left: 0; right: 0; top: 50%;
      height: 1px;
      background: rgba(255,255,255,.08);
    }
    .divider span {
      background: #1e1e1e;
      position: relative;
      padding: 0 12px;
      font-size: 13px;
      color: #6b6660;
    }
    .signin-link {
      display: block;
      text-align: center;
      color: #e8d5a3;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      padding: 10px;
      border: 1px solid rgba(232,213,163,.25);
      border-radius: 10px;
      transition: all .15s;
    }
    .signin-link:hover { background: rgba(232,213,163,.06); }
    .terms {
      font-size: 11px;
      color: #6b6660;
      text-align: center;
      margin-top: 1.25rem;
      line-height: 1.6;
    }
  `]
})
export class RegisterComponent {
  form = { name: '', email: '', password: '', bio: '' };
  loading      = false;
  errorMsg     = '';
  showPassword = false;

  constructor(
    private auth:   AuthService,
    private toast:  ToastService,
    private router: Router
  ) {}

  get passwordStrength(): { pct: number; cls: string; label: string } {
    const p = this.form.password;
    if (!p) return { pct: 0, cls: 'weak', label: '' };
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { pct: 25,  cls: 'weak',   label: 'Weak' };
    if (score <= 3) return { pct: 60,  cls: 'medium', label: 'Medium' };
    return              { pct: 100, cls: 'strong', label: 'Strong' };
  }

  submit() {
    if (!this.form.name || !this.form.email || !this.form.password) return;
    this.loading  = true;
    this.errorMsg = '';

    this.auth.register({
      name:     this.form.name.trim(),
      email:    this.form.email.trim().toLowerCase(),
      password: this.form.password,
      bio:      this.form.bio.trim()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(`Welcome to DevPulse, ${this.form.name.split(' ')[0]}! 🎉`);
        this.router.navigate(['/feed']);
      },
      error: (e: Error) => {
        this.loading  = false;
        this.errorMsg = e.message || 'Registration failed. Please try again.';
      }
    });
  }
}
