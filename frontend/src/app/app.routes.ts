import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  // ── Public pages ──────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./pages/feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./pages/article/article.component').then(m => m.ArticleComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },

  // ── Auth pages ─────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Author public profile ──────────────────────────────────
  {
    path: 'author/:id',
    loadComponent: () =>
      import('./pages/author/author.component').then(m => m.AuthorComponent)
  },

  // ── Protected: requires login ─────────────────────────────
  {
    path: 'editor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'editor/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },

  // ── Fallback ──────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];
