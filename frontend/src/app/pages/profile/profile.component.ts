import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="prof-wrap">
      <div class="ph">
        <div class="pav">SK</div>
        <div class="pi">
          <h2>Santosh Kumar Giri</h2>
          <div class="han">&#64;santoshkumargiri · DevOps Engineer</div>
          <div class="bio">
            Building and breaking things in production since 2019.
            Writing about Kubernetes, CI/CD, and the human side of platform engineering.
            First DevOps project:
            <a href="https://github.com/SantoshKumarGiri/devops-app" target="_blank">devops-app</a> on GitHub.
          </div>
          <div class="ps">
            <div><div class="n">{{ articles.length }}</div><div class="l">Articles</div></div>
            <div><div class="n">{{ totalLikes | number }}</div><div class="l">Total likes</div></div>
            <div><div class="n">{{ totalReads | number }}</div><div class="l">Total reads</div></div>
          </div>
        </div>
      </div>

      <div class="sl">Tech Stack</div>
      <div class="scs">
        <span class="sc" *ngFor="let s of stack">{{ s }}</span>
      </div>

      <div class="sl">Your Articles</div>

      <div *ngIf="loading" class="spinner"><div class="spin"></div> Loading…</div>

      <div *ngIf="!loading && articles.length === 0" class="empty">
        No articles yet. <a routerLink="/editor">Write one →</a>
      </div>

      <div *ngFor="let a of sorted" class="ac" [routerLink]="['/article', a.id]">
        <div class="cb">
          <div class="ct">{{ a.title || 'Untitled' }}</div>
          <div class="ce">{{ excerpt(a.body) }}</div>
          <div class="cf">
            <span class="tp" *ngFor="let t of parseTags(a.tags).slice(0,2)">{{ t }}</span>
            <span class="cm">👁 {{ a.reads||0 }} reads</span>
            <span class="cm">❤️ {{ a.likes||0 }} likes</span>
            <span class="cm">💬 {{ a.comments?.length||0 }}</span>
          </div>
        </div>
        <div class="ci">{{ a.emoji || '📝' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .prof-wrap { max-width:860px; margin:0 auto; padding:2rem 2rem 4rem; }
    .ph { display:flex; gap:2rem; align-items:flex-start; margin-bottom:2.5rem; padding-bottom:2rem; border-bottom:1px solid var(--border); }
    .pav { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#4ade80,#60a5fa); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .pi h2 { font-family:'Playfair Display',serif; font-size:30px; font-weight:700; margin-bottom:4px; }
    .han { color:var(--text3); font-size:14px; margin-bottom:10px; }
    .bio { color:var(--text2); font-size:15px; line-height:1.65; max-width:520px; margin-bottom:16px; }
    .bio a { color:#60a5fa; }
    .ps { display:flex; gap:28px; }
    .n { font-size:22px; font-weight:600; color:var(--accent); font-family:'Playfair Display',serif; }
    .l { font-size:12px; color:var(--text3); margin-top:2px; }
    .sl { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:10px; margin-top:1.5rem; }
    .scs { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:2rem; }
    .sc { background:var(--bg3); border:1px solid var(--border); color:var(--text2); font-size:13px; padding:5px 14px; border-radius:20px; display:flex; align-items:center; gap:6px; }
    .sc::before { content:''; width:6px; height:6px; border-radius:50%; background:#4ade80; flex-shrink:0; }
    .ac { display:flex; gap:1.5rem; padding:1.5rem 0; border-bottom:1px solid var(--border); cursor:pointer; transition:all .15s; }
    .ac:hover .ct { color:var(--accent); }
    .cb { flex:1; min-width:0; }
    .ct { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; line-height:1.3; margin-bottom:6px; transition:color .15s; }
    .ce { font-size:14px; color:var(--text2); line-height:1.65; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:12px; }
    .cf { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .tp { background:var(--tag-bg); color:var(--tag-color); font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; border:1px solid rgba(196,169,107,.2); }
    .cm { font-size:12px; color:var(--text3); }
    .ci { width:80px; height:80px; border-radius:var(--r); background:var(--bg4); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:32px; }
    .empty { color:var(--text3); padding:2rem 0; } .empty a { color:#60a5fa; }
    .spinner { display:flex; align-items:center; gap:10px; color:var(--text3); padding:2rem 0; }
    .spin { width:18px; height:18px; border:2px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:sp .7s linear infinite; }
    @keyframes sp { to { transform:rotate(360deg) } }
    @media(max-width:750px) { .ph { flex-direction:column; } }
  `]
})
export class ProfileComponent implements OnInit {
  articles: Article[] = [];
  loading = true;

  stack = ['Kubernetes','Docker','Terraform','ArgoCD','Prometheus','GitHub Actions','AWS','Node.js','Spring Boot','Linux'];

  get sorted()     { return [...this.articles].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
  get totalLikes() { return this.articles.reduce((s,a) => s+(a.likes||0), 0); }
  get totalReads() { return this.articles.reduce((s,a) => s+(a.reads||0), 0); }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getArticles().subscribe({
      next: data => { this.articles = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  parseTags(tags: string): string[] { return (tags||'').split(',').map(s=>s.trim()).filter(Boolean); }
  excerpt(body: string, len = 130): string {
    const plain = (body||'').replace(/```[\s\S]*?```/g,'[code]').replace(/[#*`>]/g,'').replace(/\n+/g,' ').trim();
    return plain.length > len ? plain.slice(0,len)+'…' : plain;
  }
}
