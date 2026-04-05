import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="art-wrap">
      <a class="back" routerLink="/feed">← Back to feed</a>

      <div *ngIf="loading" class="spinner"><div class="spin"></div> Loading article…</div>
      <div *ngIf="error" class="err-box">{{ error }}</div>

      <ng-container *ngIf="article && !loading">
        <div class="atrow">
          <span class="tp" *ngFor="let t of parseTags(article.tags)">{{ t }}</span>
        </div>
        <h1 class="atitle">{{ article.title }}</h1>
        <p class="asubt" *ngIf="article.subtitle">{{ article.subtitle }}</p>

        <div class="abyline">
          <div class="bav">SK</div>
          <div class="bi">
            <div class="bn">Santosh Kumar Giri</div>
            <div class="bd">{{ article.createdAt | date:'MMM d, y' }} · {{ readTime(article.body) }} · {{ article.reads || 0 }} reads</div>
          </div>
          <div class="ba">
            <button class="esm" [class.active]="article.liked" (click)="toggleLike()">♥ {{ article.likes || 0 }}</button>
            <button class="esm" [class.active]="article.bookmarked" (click)="toggleBookmark()">🔖 {{ article.bookmarked ? 'Saved' : 'Save' }}</button>
            <a class="esm" *ngIf="auth.isLoggedIn()" [routerLink]="['/editor', article.id]">✏️ Edit</a>
          </div>
        </div>

        <div class="acov">{{ article.emoji || '📝' }}</div>

        <div class="abody" [innerHTML]="renderedBody"></div>

        <div class="eng-row">
          <button class="eb" [class.active]="article.liked" (click)="toggleLike()">♥ {{ article.likes || 0 }} Likes</button>
          <button class="eb" (click)="focusComment()">💬 {{ article.comments?.length || 0 }} Comments</button>
          <button class="eb" [class.active]="article.bookmarked" (click)="toggleBookmark()">🔖 {{ article.bookmarked ? 'Bookmarked' : 'Bookmark' }}</button>
          <button class="eb" (click)="copyLink()">📤 Share</button>
          <button class="eb danger" *ngIf="auth.isLoggedIn()" (click)="deleteArticle()" style="margin-left:auto;">🗑 Delete</button>
        </div>

        <!-- Comments -->
        <div class="cmt-s">
          <h3>Comments ({{ article.comments?.length || 0 }})</h3>
          <div class="cmt-ir" *ngIf="auth.isLoggedIn()">
            <div class="aav" style="flex-shrink:0;">SK</div>
            <textarea id="cmt-ta" [(ngModel)]="commentText" placeholder="Share your thoughts…"></textarea>
            <button class="pcb" (click)="postComment()" [disabled]="posting">{{ posting ? '…' : 'Post' }}</button>
          </div>
          <div *ngIf="!auth.isLoggedIn()" class="login-hint">
            <a routerLink="/" [queryParams]="{login:'required'}">Sign in</a> to leave a comment.
          </div>
          <div class="cmt" *ngFor="let c of article.comments">
            <div class="cav">SK</div>
            <div class="cc">
              <div class="ch"><span class="cn">{{ c.name }}</span><span class="ctime">· {{ c.ts | date:'MMM d, y' }}</span></div>
              <div class="cbody">{{ c.text }}</div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .art-wrap { max-width:760px; margin:0 auto; padding:2rem 2rem 4rem; }
    .back { color:var(--text3); font-size:13px; display:inline-flex; align-items:center; gap:6px; margin-bottom:1.5rem; text-decoration:none; transition:color .15s; }
    .back:hover { color:var(--text); }
    .atrow { margin-bottom:14px; display:flex; gap:8px; flex-wrap:wrap; }
    .tp { background:var(--tag-bg); color:var(--tag-color); font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; border:1px solid rgba(196,169,107,.2); }
    .atitle { font-family:'Playfair Display',serif; font-size:40px; font-weight:900; line-height:1.12; margin-bottom:12px; }
    .asubt  { font-size:19px; color:var(--text2); line-height:1.6; margin-bottom:1.5rem; font-family:'Playfair Display',serif; font-style:italic; }
    .abyline { display:flex; align-items:center; gap:12px; padding:1rem 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin-bottom:1.5rem; }
    .bav { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#c4a96b,#e8d5a3); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .bi { flex:1; } .bn { font-size:14px; font-weight:600; } .bd { font-size:13px; color:var(--text3); margin-top:2px; }
    .ba { display:flex; gap:8px; }
    .esm { background:none; border:1px solid var(--border); color:var(--text2); font-family:'DM Sans',sans-serif; font-size:13px; padding:6px 14px; border-radius:20px; cursor:pointer; transition:all .15s; text-decoration:none; display:inline-block; }
    .esm:hover,.esm.active { border-color:var(--accent); color:var(--accent); background:rgba(232,213,163,.06); }
    .acov { width:100%; height:280px; background:var(--bg3); border-radius:var(--r2); margin-bottom:2rem; display:flex; align-items:center; justify-content:center; font-size:72px; }
    :host ::ng-deep .abody { font-size:18px; line-height:1.85; color:var(--text); }
    :host ::ng-deep .abody h2 { font-family:'Playfair Display',serif; font-size:27px; font-weight:700; margin:2.25rem 0 1rem; border-bottom:1px solid var(--border); padding-bottom:.5rem; }
    :host ::ng-deep .abody h3 { font-family:'Playfair Display',serif; font-size:21px; font-weight:700; margin:1.75rem 0 .75rem; }
    :host ::ng-deep .abody p  { margin-bottom:1.3rem; }
    :host ::ng-deep .abody ul, :host ::ng-deep .abody ol { margin:0 0 1.3rem 1.5rem; }
    :host ::ng-deep .abody li { margin-bottom:.4rem; }
    :host ::ng-deep .abody code { font-family:'JetBrains Mono',monospace; background:rgba(74,222,128,.08); color:#4ade80; padding:2px 7px; border-radius:4px; font-size:15px; }
    :host ::ng-deep .abody pre  { background:#1a1a1a; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:1.5rem; margin:1.5rem 0; overflow-x:auto; }
    :host ::ng-deep .abody pre code { background:none; padding:0; font-size:14px; line-height:1.7; color:#e8d5a3; }
    :host ::ng-deep .abody blockquote { border-left:3px solid #e8d5a3; padding-left:1.5rem; margin:1.5rem 0; font-style:italic; color:#9e9991; font-size:21px; font-family:'Playfair Display',serif; line-height:1.6; }
    :host ::ng-deep .abody a { color:#60a5fa; text-decoration:underline; text-underline-offset:3px; }
    :host ::ng-deep .abody strong { font-weight:600; }
    .eng-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:1.25rem 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin:2.5rem 0 1.5rem; }
    .eb { background:none; border:1px solid var(--border); color:var(--text2); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 16px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .eb:hover,.eb.active { border-color:var(--accent); color:var(--accent); background:rgba(232,213,163,.06); }
    .eb.danger:hover { border-color:var(--red); color:var(--red); background:rgba(248,113,113,.06); }
    .cmt-s h3 { font-family:'Playfair Display',serif; font-size:22px; margin-bottom:1.5rem; }
    .cmt-ir { display:flex; gap:12px; margin-bottom:2rem; align-items:flex-start; }
    .cmt-ir textarea { flex:1; background:#1a1a1a; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:12px 14px; color:#f0ede8; font-family:'DM Sans',sans-serif; font-size:14px; resize:vertical; min-height:80px; outline:none; }
    .aav { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#60a5fa,#a78bfa); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#0d0d0d; }
    .pcb { background:var(--accent); color:#0d0d0d; border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:8px 18px; border-radius:20px; cursor:pointer; white-space:nowrap; margin-top:4px; }
    .cmt { display:flex; gap:12px; margin-bottom:1.5rem; }
    .cav { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#60a5fa,#a78bfa); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .cn { font-weight:600; font-size:13px; } .ctime { color:var(--text3); font-size:12px; margin-left:6px; }
    .cbody { font-size:14px; color:var(--text2); line-height:1.65; margin-top:4px; }
    .login-hint { font-size:13px; color:var(--text3); padding:1rem 0; } .login-hint a { color:var(--blue); }
    .err-box { color:var(--red); padding:2rem; text-align:center; }
    .spinner { display:flex; align-items:center; gap:10px; color:var(--text3); padding:4rem; justify-content:center; }
    .spin { width:18px; height:18px; border:2px solid rgba(255,255,255,.14); border-top-color:#e8d5a3; border-radius:50%; animation:sp .7s linear infinite; }
    @keyframes sp { to { transform:rotate(360deg) } }
    @media(max-width:750px) { .atitle { font-size:28px; } }
  `]
})
export class ArticleComponent implements OnInit {
  article: Article | null = null;
  renderedBody: SafeHtml = '';
  loading = true;
  error = '';
  commentText = '';
  posting = false;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      if (p['id']) this.loadArticle(p['id']);
    });
  }

  loadArticle(id: string) {
    this.loading = true;
    this.api.getArticle(id).subscribe({
      next: a => {
        this.article = a;
        this.renderedBody = this.sanitizer.bypassSecurityTrustHtml(this.renderMarkdown(a.body || ''));
        this.loading = false;
        this.api.incrementRead(id).subscribe();
      },
      error: e => { this.error = e.message; this.loading = false; }
    });
  }

  toggleLike() {
    if (!this.auth.isLoggedIn()) { this.toast.error('Sign in to like.'); return; }
    this.api.toggleLike(this.article!.id).subscribe({
      next: r => { this.article!.liked = r.liked; this.article!.likes = r.likes; }
    });
  }

  toggleBookmark() {
    if (!this.auth.isLoggedIn()) { this.toast.error('Sign in to bookmark.'); return; }
    this.api.toggleBookmark(this.article!.id).subscribe({
      next: r => { this.article!.bookmarked = r.bookmarked; }
    });
  }

  postComment() {
    if (!this.commentText.trim()) return;
    this.posting = true;
    this.api.addComment(this.article!.id, this.commentText).subscribe({
      next: updated => { this.article = updated; this.commentText = ''; this.posting = false; },
      error: () => { this.toast.error('Failed to post comment.'); this.posting = false; }
    });
  }

  focusComment() { document.getElementById('cmt-ta')?.focus(); }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => this.toast.success('Link copied!'));
  }

  deleteArticle() {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    this.api.deleteArticle(this.article!.id).subscribe({
      next: () => { this.toast.error('Article deleted.'); this.router.navigate(['/feed']); }
    });
  }

  parseTags(tags: string): string[] { return (tags||'').split(',').map(s=>s.trim()).filter(Boolean); }
  readTime(body: string): string {
    const w = (body||'').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(w/200)) + ' min read';
  }

  renderMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/^### (.+)$/gm,'<h3>$1</h3>')
      .replace(/^## (.+)$/gm,'<h2>$1</h2>')
      .replace(/^# (.+)$/gm,'<h2>$1</h2>')
      .replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^- (.+)$/gm,'<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm,'<li>$2</li>')
      .replace(/\n\n/g,'</p><p>')
      .replace(/\n/g,'<br>');
  }
}
