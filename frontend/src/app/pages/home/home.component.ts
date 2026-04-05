import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-hero">
      <div class="hero-left">
        <h1>Where <span class="hl">DevOps</span><br>minds share<br>knowledge</h1>
        <p>Deep dives into Kubernetes, CI/CD, cloud architecture and platform engineering — written by engineers, for engineers.</p>
        <div class="hero-stats">
          <div class="stat"><div class="num">{{ articles.length }}</div><div class="lbl">Articles</div></div>
          <div class="stat"><div class="num">{{ totalReads | number }}</div><div class="lbl">Total reads</div></div>
          <div class="stat"><div class="num">{{ totalLikes | number }}</div><div class="lbl">Likes</div></div>
        </div>
      </div>

      <div class="tcard">
        <h3>🔥 Trending</h3>
        <div *ngIf="loading" class="spinner"><div class="spin"></div></div>
        <div *ngFor="let a of trending; let i = index" class="ti"
             [routerLink]="['/article', a.id]">
          <div class="tn">0{{ i + 1 }}</div>
          <div>
            <div class="tt">{{ a.title || 'Untitled' }}</div>
            <div class="tm">{{ a.createdAt | date:'MMM d' }} · {{ a.reads || 0 }} reads</div>
          </div>
        </div>
        <div *ngIf="!loading && trending.length === 0" class="no-trend">
          Write your first article to see it here!
        </div>
      </div>
    </div>

    <div class="feat-grid">
      <div class="sl">Recent Articles</div>

      <div *ngIf="loading" class="spinner"><div class="spin"></div> Loading…</div>

      <div *ngIf="!loading && articles.length === 0" class="empty-home">
        <div class="big">✍️</div>
        <p>No articles yet. Write your first one!</p>
        <a routerLink="/editor" class="cta-btn">Write your first article</a>
      </div>

      <div class="cg" *ngIf="!loading && articles.length > 0">
        <div class="fc" *ngFor="let a of recent" [routerLink]="['/article', a.id]">
          <div class="feat-icon">{{ a.emoji || '📝' }}</div>
          <span class="tp" *ngIf="firstTag(a.tags)">{{ firstTag(a.tags) }}</span>
          <div class="fc-title">{{ a.title || 'Untitled' }}</div>
          <div class="fc-desc">{{ excerpt(a.body) }}</div>
          <div class="fc-meta">
            <span>⏱ {{ readTime(a.body) }}</span>
            <span>❤️ {{ a.likes || 0 }}</span>
            <span>👁 {{ a.reads || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-hero {
      max-width:1100px; margin:0 auto; padding:3rem 2rem 1.5rem;
      display:grid; grid-template-columns:1fr 340px; gap:3rem; align-items:start;
    }
    h1 { font-family:'Playfair Display',serif; font-size:50px; font-weight:900; line-height:1.08; margin-bottom:14px; }
    .hl { color:var(--accent); }
    p  { color:var(--text2); font-size:16px; line-height:1.75; max-width:480px; margin-bottom:24px; }
    .hero-stats { display:flex; gap:28px; }
    .num { font-size:26px; font-weight:600; color:var(--accent); font-family:'Playfair Display',serif; }
    .lbl { font-size:12px; color:var(--text3); margin-top:2px; }
    .tcard { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); padding:1.25rem; }
    .tcard h3 { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:1rem; }
    .ti { display:flex; gap:10px; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--border); cursor:pointer; transition:all .15s; }
    .ti:last-child { border-bottom:none; }
    .ti:hover .tt { color:var(--accent); }
    .tn { font-family:'Playfair Display',serif; font-size:26px; font-weight:900; color:var(--border2); line-height:1; min-width:28px; flex-shrink:0; }
    .tt { font-size:13px; font-weight:500; line-height:1.45; transition:color .15s; }
    .tm { font-size:11px; color:var(--text3); margin-top:3px; }
    .no-trend { color:var(--text3); font-size:13px; padding:.5rem 0; }
    .feat-grid { max-width:1100px; margin:0 auto 2.5rem; padding:0 2rem; }
    .sl { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:1.25rem; }
    .cg { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:1.25rem; }
    .fc { background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); padding:1.5rem; cursor:pointer; transition:all .2s; }
    .fc:hover { border-color:rgba(232,213,163,.35); transform:translateY(-2px); }
    .feat-icon { font-size:28px; margin-bottom:1rem; }
    .tp { background:var(--tag-bg); color:var(--tag-color); font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; border:1px solid rgba(196,169,107,.2); display:inline-block; margin-bottom:10px; }
    .fc-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; line-height:1.35; margin-bottom:8px; }
    .fc-desc { font-size:13px; color:var(--text2); line-height:1.6; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .fc-meta { font-size:12px; color:var(--text3); display:flex; gap:14px; }
    .empty-home { text-align:center; padding:3rem 0; color:var(--text3); }
    .big { font-size:40px; margin-bottom:1rem; }
    .empty-home p { font-size:15px; margin-bottom:1.25rem; }
    .cta-btn { background:var(--accent); color:#0d0d0d; border:none; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; padding:9px 24px; border-radius:20px; cursor:pointer; text-decoration:none; }
    .spinner { display:flex; align-items:center; gap:10px; color:var(--text3); padding:2rem 0; }
    .spin { width:18px; height:18px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:sp .7s linear infinite; }
    @keyframes sp { to { transform:rotate(360deg) } }
    @media(max-width:750px) { .home-hero { grid-template-columns:1fr; } .tcard { display:none; } h1 { font-size:34px; } }
  `]
})
export class HomeComponent implements OnInit {
  articles: Article[] = [];
  loading = true;

  get trending() { return [...this.articles].sort((a,b) => (b.reads||0)-(a.reads||0)).slice(0,5); }
  get recent()   { return [...this.articles].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,6); }
  get totalReads() { return this.articles.reduce((s,a) => s+(a.reads||0), 0); }
  get totalLikes() { return this.articles.reduce((s,a) => s+(a.likes||0), 0); }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getArticles().subscribe({
      next: data => { this.articles = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  firstTag(tags: string): string {
    return (tags || '').split(',')[0]?.trim() || '';
  }
  excerpt(body: string, len = 160): string {
    const plain = (body||'').replace(/```[\s\S]*?```/g,'[code]').replace(/[#*`>]/g,'').replace(/\n+/g,' ').trim();
    return plain.length > len ? plain.slice(0,len)+'…' : plain;
  }
  readTime(body: string): string {
    const w = (body||'').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(w/200)) + ' min read';
  }
}
