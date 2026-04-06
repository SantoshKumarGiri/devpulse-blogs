import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav>
      <!-- Logo -->
      <a class="logo" routerLink="/">
        DevPulse <span class="logo-sub">by Santosh</span>
      </a>

      <!-- Centre nav links -->
      <div class="nav-c">
        <a class="nb" routerLink="/"        routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a class="nb" routerLink="/feed"    routerLinkActive="active">Feed</a>
        <a class="nb" routerLink="/profile" routerLinkActive="active">Profile</a>
      </div>

      <!-- Right side -->
      <div class="nav-r">

        <!-- Search -->
        <div class="sw">
          <span class="si">⌕</span>
          <input type="text"
                 placeholder="Search…"
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="doSearch()">
        </div>

        <!-- LOGGED OUT state -->
        <ng-container *ngIf="!auth.isLoggedIn()">
          <a class="nb-ghost" routerLink="/login">Sign in</a>
          <a class="btn-register" routerLink="/register">Get started →</a>
        </ng-container>

        <!-- LOGGED IN state -->
        <ng-container *ngIf="auth.isLoggedIn()">

          <!-- Write button (AUTHOR or ADMIN only) -->
          <a class="btn-write" routerLink="/editor" *ngIf="auth.isAuthor()">
            ✍ Write
          </a>

          <!-- User menu -->
          <div class="user-menu" (click)="menuOpen = !menuOpen" [class.open]="menuOpen">
            <div class="av">{{ auth.currentUser()?.avatarInitials || 'U' }}</div>
            <span class="user-name-short">{{ firstName }}</span>
            <span class="chevron">{{ menuOpen ? '▲' : '▼' }}</span>

            <!-- Dropdown -->
            <div class="dropdown" *ngIf="menuOpen" (click)="$event.stopPropagation()">
              <div class="dropdown-header">
                <div class="d-name">{{ auth.currentUser()?.name }}</div>
                <div class="d-email">{{ auth.currentUser()?.email }}</div>
                <div class="d-role">
                  <span class="role-pill" [class.admin]="auth.isAdmin()">
                    {{ auth.isAdmin() ? '⭐ Admin' : '✍️ Author' }}
                  </span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" [routerLink]="['/author', auth.getUserId()]" (click)="menuOpen=false">
                👤 My profile
              </a>
              <a class="dropdown-item" routerLink="/feed" [queryParams]="{tab:'drafts'}" (click)="menuOpen=false">
                🗒️ My drafts
              </a>
              <a class="dropdown-item" routerLink="/profile" (click)="menuOpen=false">
                📊 Dashboard
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" (click)="logout()">
                🚪 Sign out
              </button>
            </div>
          </div>

        </ng-container>

      </div>
    </nav>

    <!-- Backdrop to close menu -->
    <div class="menu-backdrop" *ngIf="menuOpen" (click)="menuOpen=false"></div>
  `,
  styles: [`
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 60px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      background: rgba(13,13,13,.92);
      position: sticky;
      top: 0;
      z-index: 200;
      backdrop-filter: blur(14px);
    }
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 900;
      color: #e8d5a3;
      text-decoration: none;
      user-select: none;
      flex-shrink: 0;
    }
    .logo-sub { color: #6b6660; font-weight: 400; font-size: 12px; margin-left: 6px; font-family: 'DM Sans', sans-serif; }

    /* Centre nav */
    .nav-c { display: flex; gap: 2px; }
    .nb {
      background: none; border: none; color: #9e9991;
      font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
      padding: 6px 14px; border-radius: 20px;
      cursor: pointer; transition: all .15s; text-decoration: none;
    }
    .nb:hover, .nb.active { background: #222; color: #f0ede8; }

    /* Right side */
    .nav-r { display: flex; align-items: center; gap: 10px; }
    .sw {
      display: flex; align-items: center; gap: 6px;
      background: #1a1a1a; border: 1px solid rgba(255,255,255,.08);
      border-radius: 20px; padding: 5px 14px;
    }
    .si { color: #6b6660; font-size: 14px; }
    .sw input {
      background: none; border: none; color: #f0ede8;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      outline: none; width: 150px;
    }
    .sw input::placeholder { color: #6b6660; }

    /* Auth buttons — logged out */
    .nb-ghost {
      background: none;
      border: 1px solid rgba(255,255,255,.14);
      color: #9e9991;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 500;
      padding: 6px 16px; border-radius: 20px;
      cursor: pointer; transition: all .15s;
      text-decoration: none;
    }
    .nb-ghost:hover { border-color: rgba(255,255,255,.25); color: #f0ede8; }
    .btn-register {
      background: #e8d5a3; color: #0d0d0d;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 700;
      padding: 7px 18px; border-radius: 20px;
      cursor: pointer; transition: all .15s;
      text-decoration: none; white-space: nowrap;
    }
    .btn-register:hover { background: #c4a96b; }

    /* Write button */
    .btn-write {
      background: #e8d5a3; color: #0d0d0d;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 700;
      padding: 7px 18px; border-radius: 20px;
      cursor: pointer; transition: all .15s;
      text-decoration: none; white-space: nowrap;
    }
    .btn-write:hover { background: #c4a96b; }

    /* User menu */
    .user-menu {
      display: flex; align-items: center; gap: 8px;
      cursor: pointer; position: relative;
      padding: 4px 10px; border-radius: 20px;
      transition: background .15s;
      user-select: none;
    }
    .user-menu:hover, .user-menu.open { background: #1a1a1a; }
    .av {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #4ade80, #60a5fa);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #0d0d0d;
      flex-shrink: 0;
    }
    .user-name-short { font-size: 13px; font-weight: 500; color: #9e9991; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chevron { font-size: 9px; color: #6b6660; }

    /* Dropdown */
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #1e1e1e;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 14px;
      min-width: 220px;
      box-shadow: 0 8px 32px rgba(0,0,0,.5);
      z-index: 300;
      overflow: hidden;
    }
    .dropdown-header { padding: 14px 16px 10px; }
    .d-name { font-size: 14px; font-weight: 600; color: #f0ede8; margin-bottom: 2px; }
    .d-email { font-size: 12px; color: #6b6660; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .d-role { }
    .role-pill {
      font-size: 11px; padding: 3px 10px; border-radius: 20px;
      background: rgba(96,165,250,.1); color: #60a5fa;
      border: 1px solid rgba(96,165,250,.3);
    }
    .role-pill.admin {
      background: rgba(232,213,163,.1); color: #e8d5a3;
      border-color: rgba(232,213,163,.3);
    }
    .dropdown-divider { height: 1px; background: rgba(255,255,255,.06); margin: 4px 0; }
    .dropdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; color: #9e9991;
      text-decoration: none; cursor: pointer;
      background: none; border: none; width: 100%;
      text-align: left;
      transition: all .12s;
    }
    .dropdown-item:hover { background: rgba(255,255,255,.04); color: #f0ede8; }
    .dropdown-item.danger:hover { color: #f87171; background: rgba(248,113,113,.06); }

    /* Backdrop */
    .menu-backdrop {
      position: fixed; inset: 0; z-index: 199;
    }

    @media(max-width: 750px) {
      .nav-c { display: none; }
      nav { padding: 0 1rem; }
      .sw { display: none; }
      .user-name-short { display: none; }
      .chevron { display: none; }
    }
  `]
})
export class NavbarComponent {
  menuOpen    = false;
  searchQuery = '';

  constructor(
    public  auth:   AuthService,
    private toast:  ToastService,
    private router: Router
  ) {}

  get firstName(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ')[0];
  }

  logout() {
    this.menuOpen = false;
    this.auth.logout();
    this.toast.success('Signed out successfully.');
  }

  doSearch() {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.router.navigate(['/feed'], { queryParams: { q } });
    this.searchQuery = '';
  }
}
