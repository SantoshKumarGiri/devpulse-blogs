import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="feed-wrap">
      <!-- MAIN LIST -->
      <div class="feed-main">
        <div class="feed-tabs">
          <button class="ftab" [class.active]="tab==='all'"       (click)="switchTab('all')">All Articles</button>
          <button class="ftab" [class.active]="tab==='bookmarks'" (click)="switchTab('bookmarks')">Bookmarked</button>
          <button class="ftab" [class.active]="tab==='drafts'"    (click)="switchTab('drafts')" *ngIf="auth.isLoggedIn()">Drafts</button>
        </div>

        <div *ngIf="searchQuery" class="search-banner">
          Search results for "<strong>{{ searchQuery }}</strong>" — {{ list.length }} found
          <button (click)="clearSearch()">✕ Clear</button>
        </div>

        <div *ngIf="loading" class="spinner"><div class="spin"></div> Loading…</div>

        <div *ngIf="!loading && list.length === 0" class="empty">
          <div class="big">{{ tab==='drafts' ? '🗒️' : tab==='bookmarks' ? '🔖' : '✍️' }}</div>
          <p>{{ tab==='drafts' ? 'No drafts yet.' : tab==='bookmarks' ? 'No bookmarks yet.' : 'No articles yet!' }}</p>
          <a routerLink="/editor" class="cta" *ngIf="tab !== 'bookmarks' && auth.isLoggedIn()">Write your first article</a>
        </div>

        <div *ngFor="let a of list" class="ac"
             [routerLink]="a.draft ? ['/editor', a.id] : ['/article', a.id]">
          <div class="cb">
            <div class="cau">
              <div class="aav">SK</div>
              <span class="an">Santosh Kumar Giri</span>
              <span class="cd">· {{ a.createdAt | date:'MMM d, y' }}</span>
              <span class="draft-badge" *ngIf="a.draft">Draft</span>
            </div>
            <div class="ct">{{ a.title || 'Untitled' }}</div>
            <div class="ce">{{ excerpt(a.body) }}</div>
            <div class="cf">
              <span class="tp" *ngFor="let t of parseTags(a.tags).slice(0,2)">{{ t }}</span>
              <span class="cm">⏱ {{ readTime(a.body) }}</span>
              <button class="lb" [class.liked]="a.liked" *ngIf="!a.draft"
                      (click)="toggleLike($event, a)">♥ {{ a.likes || 0 }}</button>
              <button class="bkb" [class.saved]="a.bookmarked" *ngIf="!a.draft"
                      (click)="toggleBookmark($event, a)">🔖</button>
              <button class="db" (click)="deleteArticle($event, a)">🗑</button>
            </div>
          </div>
          <div class="ci">{{ a.emoji || '📝' }}</div>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="sidebar">
        <div class="sidebar-s">
          <h3>Browse Topics</h3>
          <div class="ttags">
            <span class="ttag" *ngFor="let t of topicTags"
                  [class.active-tag]="activeTag===t"
                  (click)="filterByTag(t)">{{ t }}</span>
          </div>
        </div>
        <div class="sidebar-s">
          <h3>Your Stats</h3>
          <div class="ms-grid">
            <div class="ms"><div class="n accent">{{ allArticles.length }}</div><div class="l">Articles</div></div>
            <div class="ms"><div class="n green">{{ totalLikes }}</div><div class="l">Likes</div></div>
            <div class="ms"><div class="n blue">{{ bookmarkCount }}</div><div class="l">Saved</div></div>
            <div class="ms"><div class="n red">{{ drafts.length }}</div><div class="l">Drafts</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feed-wrap { max-width:1100px; margin:0 auto; padding:2rem; display:grid; grid-template-columns:1fr 300px; gap:2.5rem; }
    .feed-tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:1.5rem; }
    .ftab { background:none; border:none; border-bottom:2px solid transparent; color:var(--text2); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; padding:8px 18px 12px; cursor:pointer; transition:all .15s; margin-bottom:-1px; }
    .ftab:hover { color:var(--text); }
    .ftab.active { color:var(--accent); border-bottom-color:var(--accent); }
    .search-banner { background:rgba(232,213,163,.08); border:1px solid rgba(232,213,163,.2); border-radius:var(--r); padding:10px 16px; font-size:13px; color:var(--accent2); margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; }
    .search-banner button { background:none; border:none; color:var(--text3); cursor:pointer; font-size:13px; }
    .ac { display:flex; gap:1.5rem; padding:1.5rem 0; border-bottom:1px solid var(--border); cursor:pointer; transition:all .15s; }
    .ac:hover .ct { color:var(--accent); }
    .cb { flex:1; min-width:0; }
    .cau { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
    .aav { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#c4a96b,#e8d5a3); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .an { font-size:13px; font-weight:500; color:var(--text2); }
    .cd { font-size:12px; color:var(--text3); }
    .draft-badge { background:rgba(248,113,113,.1); color:var(--red); border:1px solid rgba(248,113,113,.2); font-size:11px; padding:2px 8px; border-radius:20px; }
    .ct { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; line-height:1.3; margin-bottom:6px; transition:color .15s; }
    .ce { font-size:14px; color:var(--text2); line-height:1.65; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:12px; }
    .cf { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .tp { background:var(--tag-bg); color:var(--tag-color); font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; border:1px solid rgba(196,169,107,.2); }
    .cm { font-size:12px; color:var(--text3); }
    .ci { width:120px; height:88px; border-radius:var(--r); background:var(--bg4); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:32px; }
    .lb,.bkb,.db { background:none; border:none; color:var(--text3); cursor:pointer; font-size:12px; padding:4px 8px; border-radius:6px; transition:all .15s; font-family:'DM Sans',sans-serif; }
    .lb:hover { color:var(--red); background:rgba(248,113,113,.1); } .lb.liked { color:var(--red); }
    .bkb:hover { color:var(--accent); background:rgba(232,213,163,.1); } .bkb.saved { color:var(--accent); }
    .db:hover { color:var(--red); background:rgba(248,113,113,.1); }
    .sidebar-s { margin-bottom:2rem; }
    .sidebar-s h3 { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:1rem; }
    .ttags { display:flex; flex-wrap:wrap; gap:8px; }
    .ttag { background:var(--bg3); border:1px solid var(--border); color:var(--text2); font-size:13px; padding:5px 14px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .ttag:hover, .ttag.active-tag { border-color:var(--accent); color:var(--accent); }
    .ms-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .ms { background:var(--bg3); border-radius:var(--r); padding:12px; text-align:center; }
    .ms .n { font-size:20px; font-weight:600; } .ms .l { font-size:11px; color:var(--text3); margin-top:2px; }
    .accent { color:var(--accent); } .green { color:var(--green); } .blue { color:var(--blue); } .red { color:var(--red); }
    .empty { text-align:center; padding:4rem 2rem; color:var(--text3); }
    .big { font-size:40px; margin-bottom:1rem; }
    .empty p { font-size:15px; margin-bottom:1.5rem; }
    .cta { background:var(--accent); color:#0d0d0d; border:none; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; padding:9px 24px; border-radius:20px; cursor:pointer; text-decoration:none; }
    .spinner { display:flex; align-items:center; gap:10px; color:var(--text3); padding:2rem 0; font-size:14px; }
    .spin { width:18px; height:18px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:sp .7s linear infinite; flex-shrink:0; }
    @keyframes sp { to { transform:rotate(360deg) } }
    @media(max-width:750px) { .feed-wrap { grid-template-columns:1fr; } .sidebar { display:none; } }
  `]
})
export class FeedComponent implements OnInit {
  allArticles: Article[] = [];
  drafts: Article[] = [];
  tab = 'all';
  loading = true;
  activeTag = '';
  searchQuery = '';

  topicTags = ['Docker','Kubernetes','CI/CD','Terraform','Observability','GitOps','AWS','SRE','Security'];

  get list(): Article[] {
    let items: Article[] = [];
    if (this.tab === 'all') {
      items = this.searchQuery
        ? this.allArticles.filter(a =>
            (a.title||'').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            (a.body||'').toLowerCase().includes(this.searchQuery.toLowerCase()))
        : [...this.allArticles];
      if (this.activeTag) items = items.filter(a => this.parseTags(a.tags).includes(this.activeTag));
    } else if (this.tab === 'bookmarks') {
      items = this.allArticles.filter(a => a.bookmarked);
    } else {
      items = [...this.drafts];
    }
    return items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get totalLikes()    { return this.allArticles.reduce((s,a) => s+(a.likes||0), 0); }
  get bookmarkCount() { return this.allArticles.filter(a => a.bookmarked).length; }

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['q']) { this.searchQuery = p['q']; }
    });
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.api.getArticles().subscribe({
      next: data => {
        this.allArticles = data;
        if (this.auth.isLoggedIn()) {
          this.api.getDrafts().subscribe({ next: d => { this.drafts = d; this.loading = false; }, error: () => { this.loading = false; } });
        } else { this.loading = false; }
      },
      error: () => { this.loading = false; }
    });
  }

  switchTab(t: string) { this.tab = t; this.activeTag = ''; }
  filterByTag(tag: string) { this.activeTag = this.activeTag === tag ? '' : tag; this.tab = 'all'; }
  clearSearch() { this.searchQuery = ''; this.router.navigate(['/feed']); }

  toggleLike(e: Event, a: Article) {
    e.stopPropagation(); e.preventDefault();
    if (!this.auth.isLoggedIn()) { this.toast.error('Sign in to like.'); return; }
    this.api.toggleLike(a.id).subscribe({ next: r => { a.liked = r.liked; a.likes = r.likes; } });
  }

  toggleBookmark(e: Event, a: Article) {
    e.stopPropagation(); e.preventDefault();
    if (!this.auth.isLoggedIn()) { this.toast.error('Sign in to bookmark.'); return; }
    this.api.toggleBookmark(a.id).subscribe({ next: r => { a.bookmarked = r.bookmarked; } });
  }

  deleteArticle(e: Event, a: Article) {
    e.stopPropagation(); e.preventDefault();
    if (!this.auth.isLoggedIn()) { this.toast.error('Sign in to delete.'); return; }
    if (!confirm('Delete this article? This cannot be undone.')) return;
    this.api.deleteArticle(a.id).subscribe({
      next: () => {
        this.allArticles = this.allArticles.filter(x => x.id !== a.id);
        this.drafts = this.drafts.filter(x => x.id !== a.id);
        this.toast.error('Article deleted.');
      }
    });
  }

  parseTags(tags: string): string[] { return (tags||'').split(',').map(s=>s.trim()).filter(Boolean); }
  excerpt(body: string, len = 160): string {
    const plain = (body||'').replace(/```[\s\S]*?```/g,'[code]').replace(/[#*`>]/g,'').replace(/\n+/g,' ').trim();
    return plain.length > len ? plain.slice(0,len)+'…' : plain;
  }
  readTime(body: string): string {
    const w = (body||'').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(w/200)) + ' min read';
  }
}
