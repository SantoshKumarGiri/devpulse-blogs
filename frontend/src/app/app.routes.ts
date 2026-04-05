import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./pages/article/article.component').then(m => m.ArticleComponent)
  },
  {
    path: 'editor',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'editor/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: '' }
];
