import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article.model';

interface AuthorProfile {
  id:        string;
  name:      string;
  bio:       string;
  initials:  string;
  role:      string;
  joinedAt:  string;
}

@Component({
  selector: 'app-author',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="author-wrap">

      <!-- Loading -->
      <div *ngIf="loading" class="spinner">
        <div class="spin"></div> Loading profile…
      </div>

      <!-- Error -->
      <div *ngIf="error" class="err-box">{{ error }}</div>

      <!-- Profile -->
      <ng-container *ngIf="author && !loading">

        <!-- Hero -->
        <div class="hero">
          <div class="avatar-lg">{{ author.initials }}</div>
          <div class="hero-info">
            <div class="hero-name">{{ author.name }}</div>
            <div class="hero-role">
              <span class="role-badge" [class.admin]="author.role === 'ADMIN'">
                {{ author.role === 'ADMIN' ? '⭐ Admin' : '✍️ Author' }}
              </span>
              <span class="joined">Joined {{ author.joinedAt | date:'MMMM y' }}</span>
            </div>
            <p class="hero-bio" *ngIf="author.bio">{{ author.bio }}</p>
            <p class="hero-bio no-bio" *ngIf="!author.bio">No bio yet.</p>
          </div>

          <!-- Edit own profile hint -->
          <div class="own-profile-hint" *ngIf="isOwnProfile()">
            <span>This is your public profile</span>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="stats-bar">
          <div class="stat">
            <div class="stat-n">{{ articles.length }}</div>
            <div class="stat-l">Articles</div>
          </div>
          <div class="stat">
            <div class="stat-n">{{ totalLikes }}</div>
            <div class="stat-l">Likes received</div>
          </div>
          <div class="stat">
            <div class="stat-n">{{ totalReads | number }}</div>
            <div class="stat-l">Total reads</div>
          </div>
        </div>

        <!-- Articles -->
        <div class="section-label">Articles by {{ author.name }}</div>

        <div *ngIf="artLoading" class="spinner" style="padding:2rem 0">
          <div class="spin"></div> Loading articles…
        </div>

        <div *ngIf="!artLoading && articles.length === 0" class="empty">
          <div class="empty-icon">✍️</div>
          <p>No published articles yet.</p>
        </div>

        <div class="article-list" *ngIf="!artLoading && articles.length > 0">
          <div class="ac" *ngFor="let a of articles"
               [routerLink]="['/article', a.id]">
            <div class="cb">
              <div class="ct">{{ a.title || 'Untitled' }}</div>
              <div class="ce">{{ excerpt(a.body) }}</div>
              <div class="cf">
                <span class="tp" *ngFor="let t of parseTags(a.tags).slice(0,2)">{{ t }}</span>
                <span class="cm">⏱ {{ readTime(a.body) }}</span>
                <span class="cm">❤️ {{ a.likes || 0 }}</span>
                <span class="cm">👁 {{ a.reads || 0 }}</span>
                <span class="cm">{{ a.createdAt | date:'MMM d, y' }}</span>
              </div>
            </div>
            <div class="ci">{{ a.emoji || '📝' }}</div>
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .author-wrap { max-width: 860px; margin: 0 auto; padding: 2rem 2rem 4rem; }

    /* Hero */
    .hero {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(255,255,255,.08);
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .avatar-lg {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c4a96b, #e8d5a3);
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 700; color: #0d0d0d;
      flex-shrink: 0;
    }
    .hero-info { flex: 1; min-width: 0; }
    .hero-name {
      font-family: 'Playfair Display', serif;
      font-size: 30px; font-weight: 700;
      margin-bottom: 6px;
    }
    .hero-role {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 10px; flex-wrap: wrap;
    }
    .role-badge {
      font-size: 12px; font-weight: 500;
      padding: 3px 10px; border-radius: 20px;
      background: rgba(96,165,250,.1);
      color: #60a5fa;
      border: 1px solid rgba(96,165,250,.3);
    }
    .role-badge.admin {
      background: rgba(232,213,163,.1);
      color: #e8d5a3;
      border-color: rgba(232,213,163,.3);
    }
    .joined { font-size: 13px; color: #6b6660; }
    .hero-bio { font-size: 15px; color: #9e9991; line-height: 1.65; max-width: 540px; }
    .no-bio { font-style: italic; color: #6b6660; }
    .own-profile-hint {
      margin-left: auto;
      font-size: 12px;
      color: #6b6660;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 20px;
      padding: 5px 14px;
      white-space: nowrap;
    }

    /* Stats */
    .stats-bar {
      display: flex; gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .stat-n { font-size: 24px; font-weight: 600; color: #e8d5a3; font-family: 'Playfair Display', serif; }
    .stat-l { font-size: 12px; color: #6b6660; margin-top: 2px; }

    /* Section label */
    .section-label {
      font-size: 11px; font-weight: 600; color: #6b6660;
      text-transform: uppercase; letter-spacing: .1em;
      margin-bottom: 1.25rem;
    }

    /* Article list */
    .ac {
      display: flex; gap: 1.5rem;
      padding: 1.5rem 0;
      border-bottom: 1px solid rgba(255,255,255,.08);
      cursor: pointer;
      transition: all .15s;
    }
    .ac:hover .ct { color: #e8d5a3; }
    .cb { flex: 1; min-width: 0; }
    .ct {
      font-family: 'Playfair Display', serif;
      font-size: 20px; font-weight: 700;
      line-height: 1.3; margin-bottom: 6px;
      transition: color .15s;
    }
    .ce {
      font-size: 14px; color: #9e9991; line-height: 1.65;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .cf { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .tp {
      background: rgba(232,213,163,.1); color: #c4a96b;
      font-size: 11px; font-weight: 500;
      padding: 3px 10px; border-radius: 20px;
      border: 1px solid rgba(196,169,107,.2);
    }
    .cm { font-size: 12px; color: #6b6660; }
    .ci {
      width: 100px; height: 80px;
      border-radius: 8px; background: #1a1a1a;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
    }

    /* Empty / error / spinner */
    .empty { text-align: center; padding: 3rem 0; color: #6b6660; }
    .empty-icon { font-size: 36px; margin-bottom: 1rem; }
    .empty p { font-size: 15px; }
    .err-box { color: #f87171; padding: 2rem; text-align: center; }
    .spinner { display: flex; align-items: center; gap: 10px; color: #6b6660; padding: 3rem; justify-content: center; font-size: 14px; }
    .spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.14); border-top-color: #e8d5a3; border-radius: 50%; animation: sp .7s linear infinite; flex-shrink: 0; }
    @keyframes sp { to { transform: rotate(360deg); } }

    @media(max-width: 600px) {
      .hero { flex-direction: column; }
      .own-profile-hint { margin-left: 0; }
    }
  `]
})
export class AuthorComponent implements OnInit {
  author:     AuthorProfile | null = null;
  articles:   Article[] = [];
  loading     = true;
  artLoading  = true;
  error       = '';

  get totalLikes() { return this.articles.reduce((s, a) => s + (a.likes || 0), 0); }
  get totalReads() { return this.articles.reduce((s, a) => s + (a.reads || 0), 0); }

  constructor(
    private api:   ApiService,
    public  auth:  AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      if (p['id']) this.loadAuthor(p['id']);
    });
  }

  loadAuthor(id: string) {
    this.loading    = true;
    this.artLoading = true;

    // Load profile
    this.api.getAuthorProfile(id).subscribe({
      next:  p => { this.author = p; this.loading = false; },
      error: e => { this.error = e.message; this.loading = false; }
    });

    // Load articles
    this.api.getAuthorArticles(id).subscribe({
      next:  a => { this.articles = a; this.artLoading = false; },
      error: () => { this.artLoading = false; }
    });
  }

  isOwnProfile(): boolean {
    return this.auth.isLoggedIn() && this.author?.id === this.auth.getUserId();
  }

  parseTags(tags: string): string[] {
    return (tags || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  excerpt(body: string, len = 140): string {
    const plain = (body || '')
      .replace(/```[\s\S]*?```/g, '[code]')
      .replace(/[#*`>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return plain.length > len ? plain.slice(0, len) + '…' : plain;
  }

  readTime(body: string): string {
    const w = (body || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(w / 200)) + ' min read';
  }
}
