import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav>
      <a class="logo" routerLink="/">DevPulse <span>by Santosh</span></a>

      <div class="nav-c">
        <a class="nb" routerLink="/"       routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a class="nb" routerLink="/feed"   routerLinkActive="active">Feed</a>
        <a class="nb" routerLink="/profile" routerLinkActive="active">Profile</a>
      </div>

      <div class="nav-r">
        <div class="sw">
          <span class="si">⌕</span>
          <input type="text" placeholder="Search…"
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="doSearch()"
                 (input)="onSearchInput()">
        </div>

        <a class="btn-write" routerLink="/editor">✍ Write</a>

        <button class="auth-badge"
                [class.in]="auth.isLoggedIn()"
                [class.out]="!auth.isLoggedIn()"
                (click)="toggleAuth()">
          {{ auth.isLoggedIn() ? '✓ Admin' : 'Sign in' }}
        </button>

        <a class="av" routerLink="/profile">SK</a>
      </div>
    </nav>

    <!-- Login Modal -->
    <div class="overlay" *ngIf="showLogin" (click)="closeModal($event)">
      <div class="modal">
        <div class="modal-icon">🔐</div>
        <h2>Welcome back, Santosh</h2>
        <p>Enter your admin password to write and manage your blog</p>
        <input type="password" placeholder="Admin password"
               [(ngModel)]="password"
               (keyup.enter)="doLogin()"
               [class.error-input]="loginError">
        <div class="err">{{ loginError }}</div>
        <button class="login-btn" (click)="doLogin()" [disabled]="loading">
          {{ loading ? 'Signing in…' : 'Sign in →' }}
        </button>
        <div class="skip" (click)="showLogin=false">Continue as reader (read-only)</div>
      </div>
    </div>
  `,
  styles: [`
    nav {
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2rem; height:60px;
      border-bottom:1px solid var(--border);
      background:rgba(13,13,13,0.92);
      position:sticky; top:0; z-index:200;
      backdrop-filter:blur(14px);
    }
    .logo {
      font-family:'Playfair Display',serif; font-size:22px; font-weight:900;
      color:var(--accent); text-decoration:none; user-select:none;
    }
    .logo span { color:var(--text3); font-weight:400; font-size:12px; margin-left:6px; font-family:'DM Sans',sans-serif; }
    .nav-c { display:flex; gap:2px; }
    .nb {
      background:none; border:none; color:var(--text2); font-family:'DM Sans',sans-serif;
      font-size:13px; font-weight:500; padding:6px 14px; border-radius:20px;
      cursor:pointer; transition:all .15s; text-decoration:none;
    }
    .nb:hover, .nb.active { background:var(--bg4); color:var(--text); }
    .nav-r { display:flex; align-items:center; gap:10px; }
    .btn-write {
      background:var(--accent); color:#0d0d0d; border:none;
      font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
      padding:7px 18px; border-radius:20px; cursor:pointer;
      transition:all .15s; text-decoration:none;
    }
    .btn-write:hover { background:var(--accent2); }
    .sw {
      display:flex; align-items:center; gap:6px;
      background:var(--bg3); border:1px solid var(--border);
      border-radius:20px; padding:5px 14px;
    }
    .si { color:var(--text3); font-size:14px; }
    .sw input {
      background:none; border:none; color:var(--text);
      font-family:'DM Sans',sans-serif; font-size:13px; outline:none; width:160px;
    }
    .sw input::placeholder { color:var(--text3); }
    .auth-badge {
      font-size:11px; padding:5px 12px; border-radius:20px; border:1px solid;
      cursor:pointer; background:none; font-family:'DM Sans',sans-serif; transition:all .15s;
    }
    .auth-badge.in  { color:#4ade80; border-color:rgba(74,222,128,.3); background:rgba(74,222,128,.08); }
    .auth-badge.out { color:var(--text3); border-color:var(--border); }
    .av {
      width:32px; height:32px; border-radius:50%;
      background:linear-gradient(135deg,#4ade80,#60a5fa);
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; color:#0d0d0d; cursor:pointer; text-decoration:none;
    }
    /* Modal */
    .overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.88); z-index:500;
      display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);
    }
    .modal {
      background:var(--surface); border:1px solid var(--border2);
      border-radius:var(--r2); padding:2.5rem; width:100%; max-width:380px; text-align:center;
    }
    .modal-icon { font-size:40px; margin-bottom:12px; }
    .modal h2 { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; margin-bottom:6px; }
    .modal p  { color:var(--text3); font-size:13px; margin-bottom:1.5rem; }
    .modal input {
      width:100%; background:var(--bg3); border:1px solid var(--border2);
      color:var(--text); font-family:'DM Sans',sans-serif; font-size:15px;
      padding:11px 16px; border-radius:var(--r); outline:none; margin-bottom:8px;
      transition:border-color .15s;
    }
    .modal input:focus { border-color:var(--accent); }
    .modal input.error-input { border-color:var(--red); }
    .err { color:var(--red); font-size:12px; min-height:18px; margin-bottom:8px; }
    .login-btn {
      width:100%; background:var(--accent); color:#0d0d0d; border:none;
      font-family:'DM Sans',sans-serif; font-size:15px; font-weight:700;
      padding:11px; border-radius:var(--r); cursor:pointer; transition:all .15s;
    }
    .login-btn:hover:not(:disabled) { background:var(--accent2); }
    .login-btn:disabled { opacity:.6; cursor:not-allowed; }
    .skip { color:var(--text3); font-size:13px; margin-top:14px; cursor:pointer; text-decoration:underline; }
    @media(max-width:750px) { .nav-c { display:none; } nav { padding:0 1rem; } }
  `]
})
export class NavbarComponent {
  showLogin = false;
  password  = '';
  loginError = '';
  loading   = false;
  searchQuery = '';

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private toast: ToastService,
    private router: Router
  ) {}

  toggleAuth() {
    if (this.auth.isLoggedIn()) {
      this.auth.logout();
      this.toast.success('Signed out.');
    } else {
      this.showLogin = true;
      this.password  = '';
      this.loginError = '';
    }
  }

  doLogin() {
    if (!this.password) { this.loginError = 'Enter your password.'; return; }
    this.loading = true;
    this.loginError = '';
    this.auth.login(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.showLogin = false;
        this.toast.success('✓ Signed in! Welcome back, Santosh 👋');
      },
      error: (e: Error) => {
        this.loading = false;
        this.loginError = e.message;
      }
    });
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.showLogin = false;
    }
  }

  onSearchInput() {
    if (!this.searchQuery.trim()) return;
  }

  doSearch() {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/feed'], { queryParams: { q: this.searchQuery } });
  }
}
