import { Component, OnInit, HostListener } from '@angular/core';
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
    <!-- Reading progress bar -->
    <div class="read-prog" [style.width.%]="readProgress"></div>

    <div class="art-wrap">
      <a class="back" routerLink="/feed">← Back to feed</a>

      <div *ngIf="loading" class="spinner"><div class="spin"></div> Loading article…</div>
      <div *ngIf="error" class="err-box">{{ error }}</div>

      <ng-container *ngIf="article && !loading">
        <!-- Tags -->
        <div class="atrow">
          <span class="tp" *ngFor="let t of parseTags(article.tags)">{{ t }}</span>
        </div>

        <!-- Title -->
        <h1 class="atitle">{{ article.title }}</h1>
        <p class="asubt" *ngIf="article.subtitle">{{ article.subtitle }}</p>

        <!-- Byline -->
        <div class="abyline">
          <div class="bav">{{ article.authorInitials || 'SK' }}</div>
          <div class="bi">
            <div class="bn">{{ article.authorName || 'Santosh Kumar Giri' }}</div>
            <div class="bd">
              {{ article.createdAt | date:'MMM d, y' }} ·
              {{ readTime(article.body) }} ·
              {{ article.reads || 0 }} reads
            </div>
          </div>
          <div class="ba">
            <button class="esm" [class.active]="article.liked" (click)="toggleLike()">
              ♥ {{ article.likes || 0 }}
            </button>
            <button class="esm" [class.active]="article.bookmarked" (click)="toggleBookmark()">
              🔖 {{ article.bookmarked ? 'Saved' : 'Save' }}
            </button>
            <a class="esm" *ngIf="auth.isAuthor()" [routerLink]="['/editor', article.id]">
              ✏️ Edit
            </a>
          </div>
        </div>

        <!-- Cover image or emoji -->
        <div class="acov">
          <img *ngIf="article.coverImageUrl"
               [src]="article.coverImageUrl"
               alt="Cover"
               class="cover-img"
               (error)="onImgError($event)">
          <span *ngIf="!article.coverImageUrl" class="cover-emoji">
            {{ article.emoji || '📝' }}
          </span>
        </div>

        <!-- Article body — rendered markdown -->
        <div class="abody" [innerHTML]="renderedBody"></div>

        <!-- Engagement row -->
        <div class="eng-row">
          <button class="eb" [class.active]="article.liked" (click)="toggleLike()">
            ♥ {{ article.likes || 0 }} Likes
          </button>
          <button class="eb" (click)="focusComment()">
            💬 {{ article.comments?.length || 0 }} Comments
          </button>
          <button class="eb" [class.active]="article.bookmarked" (click)="toggleBookmark()">
            🔖 {{ article.bookmarked ? 'Bookmarked' : 'Bookmark' }}
          </button>
          <button class="eb" (click)="copyLink()">📤 Share</button>
          <button class="eb danger" *ngIf="canDelete()" (click)="deleteArticle()" style="margin-left:auto;">
            🗑 Delete
          </button>
        </div>

        <!-- Comments -->
        <div class="cmt-s">
          <h3>Comments ({{ article.comments?.length || 0 }})</h3>
          <div class="cmt-ir" *ngIf="auth.isLoggedIn()">
            <div class="aav" style="flex-shrink:0;">
              {{ auth.currentUser()?.avatarInitials || 'U' }}
            </div>
            <textarea id="cmt-ta"
                      [(ngModel)]="commentText"
                      placeholder="Share your thoughts…"></textarea>
            <button class="pcb" (click)="postComment()" [disabled]="posting">
              {{ posting ? '…' : 'Post' }}
            </button>
          </div>
          <div *ngIf="!auth.isLoggedIn()" class="login-hint">
            <a routerLink="/login">Sign in</a> to leave a comment.
          </div>
          <div class="cmt" *ngFor="let c of article.comments">
            <div class="cav">{{ c.initials || '?' }}</div>
            <div class="cc">
              <div class="ch">
                <span class="cn">{{ c.name }}</span>
                <span class="ctime">· {{ c.ts | date:'MMM d, y' }}</span>
              </div>
              <div class="cbody">{{ c.text }}</div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .read-prog { position:fixed; top:0; left:0; height:3px; background:#e8d5a3; z-index:300; transition:width .1s linear; pointer-events:none; }
    .art-wrap { max-width:760px; margin:0 auto; padding:2rem 2rem 4rem; }
    .back { color:var(--text3,#6b6660); font-size:13px; display:inline-flex; align-items:center; gap:6px; margin-bottom:1.5rem; text-decoration:none; transition:color .15s; }
    .back:hover { color:var(--text,#f0ede8); }
    .atrow { margin-bottom:14px; display:flex; gap:8px; flex-wrap:wrap; }
    .tp { background:rgba(232,213,163,.1); color:#c4a96b; font-size:11px; font-weight:500; padding:3px 10px; border-radius:20px; border:1px solid rgba(196,169,107,.2); }
    .atitle { font-family:'Playfair Display',serif; font-size:40px; font-weight:900; line-height:1.12; margin-bottom:12px; }
    .asubt  { font-size:19px; color:var(--text2,#9e9991); line-height:1.6; margin-bottom:1.5rem; font-family:'Playfair Display',serif; font-style:italic; }
    .abyline { display:flex; align-items:center; gap:12px; padding:1rem 0; border-top:1px solid rgba(255,255,255,.08); border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:1.5rem; }
    .bav { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#c4a96b,#e8d5a3); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .bi  { flex:1; }
    .bn  { font-size:14px; font-weight:600; }
    .bd  { font-size:13px; color:var(--text3,#6b6660); margin-top:2px; }
    .ba  { display:flex; gap:8px; flex-wrap:wrap; }
    .esm { background:none; border:1px solid rgba(255,255,255,.08); color:var(--text2,#9e9991); font-family:'DM Sans',sans-serif; font-size:13px; padding:6px 14px; border-radius:20px; cursor:pointer; transition:all .15s; text-decoration:none; display:inline-block; }
    .esm:hover,.esm.active { border-color:#e8d5a3; color:#e8d5a3; background:rgba(232,213,163,.06); }
    /* Cover */
    .acov { width:100%; height:300px; background:#1a1a1a; border-radius:14px; margin-bottom:2rem; display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .cover-img  { width:100%; height:100%; object-fit:cover; }
    .cover-emoji { font-size:72px; line-height:1; }
    /* Article body styles */
    :host ::ng-deep .abody { font-size:18px; line-height:1.85; color:var(--text,#f0ede8); word-break:break-word; }
    :host ::ng-deep .abody h1,
    :host ::ng-deep .abody h2 { font-family:'Playfair Display',serif; font-size:27px; font-weight:700; margin:2.25rem 0 1rem; border-bottom:1px solid rgba(255,255,255,.08); padding-bottom:.5rem; }
    :host ::ng-deep .abody h3 { font-family:'Playfair Display',serif; font-size:21px; font-weight:700; margin:1.75rem 0 .75rem; }
    :host ::ng-deep .abody p   { margin-bottom:1.3rem; }
    :host ::ng-deep .abody ul,
    :host ::ng-deep .abody ol  { margin:0 0 1.3rem 1.5rem; }
    :host ::ng-deep .abody li  { margin-bottom:.4rem; }
    :host ::ng-deep .abody code { font-family:'JetBrains Mono',monospace; background:rgba(74,222,128,.08); color:#4ade80; padding:2px 7px; border-radius:4px; font-size:15px; }
    :host ::ng-deep .abody pre  { background:#1a1a1a; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:1.5rem; margin:1.5rem 0; overflow-x:auto; }
    :host ::ng-deep .abody pre code { background:none; padding:0; font-size:14px; line-height:1.7; color:#e8d5a3; }
    :host ::ng-deep .abody blockquote { border-left:3px solid #e8d5a3; padding-left:1.5rem; margin:1.5rem 0; font-style:italic; color:var(--text2,#9e9991); font-size:21px; font-family:'Playfair Display',serif; line-height:1.6; }
    :host ::ng-deep .abody a    { color:#60a5fa; text-decoration:underline; text-underline-offset:3px; }
    :host ::ng-deep .abody strong { font-weight:600; }
    :host ::ng-deep .abody em    { font-style:italic; }
    :host ::ng-deep .abody hr   { border:none; border-top:1px solid rgba(255,255,255,.08); margin:2rem 0; }
    :host ::ng-deep .abody img  { max-width:100%; border-radius:8px; margin:1rem 0; }
    /* Engagement */
    .eng-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:1.25rem 0; border-top:1px solid rgba(255,255,255,.08); border-bottom:1px solid rgba(255,255,255,.08); margin:2.5rem 0 1.5rem; }
    .eb { background:none; border:1px solid rgba(255,255,255,.08); color:var(--text2,#9e9991); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 16px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .eb:hover,.eb.active { border-color:#e8d5a3; color:#e8d5a3; background:rgba(232,213,163,.06); }
    .eb.danger:hover { border-color:#f87171; color:#f87171; background:rgba(248,113,113,.06); }
    /* Comments */
    .cmt-s h3 { font-family:'Playfair Display',serif; font-size:22px; margin-bottom:1.5rem; }
    .cmt-ir   { display:flex; gap:12px; margin-bottom:2rem; align-items:flex-start; }
    .cmt-ir textarea { flex:1; background:#1a1a1a; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:12px 14px; color:var(--text,#f0ede8); font-family:'DM Sans',sans-serif; font-size:14px; resize:vertical; min-height:80px; outline:none; }
    .aav  { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#60a5fa,#a78bfa); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .pcb  { background:#e8d5a3; color:#0d0d0d; border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:8px 18px; border-radius:20px; cursor:pointer; white-space:nowrap; margin-top:4px; }
    .cmt  { display:flex; gap:12px; margin-bottom:1.5rem; }
    .cav  { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#60a5fa,#a78bfa); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#0d0d0d; flex-shrink:0; }
    .cn   { font-weight:600; font-size:13px; }
    .ctime { color:var(--text3,#6b6660); font-size:12px; margin-left:6px; }
    .cbody { font-size:14px; color:var(--text2,#9e9991); line-height:1.65; margin-top:4px; }
    .login-hint { font-size:13px; color:var(--text3,#6b6660); padding:1rem 0; }
    .login-hint a { color:#60a5fa; }
    .err-box  { color:#f87171; padding:2rem; text-align:center; }
    .spinner  { display:flex; align-items:center; gap:10px; color:var(--text3,#6b6660); padding:4rem; justify-content:center; }
    .spin { width:18px; height:18px; border:2px solid rgba(255,255,255,.14); border-top-color:#e8d5a3; border-radius:50%; animation:sp .7s linear infinite; }
    @keyframes sp { to { transform:rotate(360deg) } }
    @media(max-width:750px) { .atitle { font-size:28px; } }
  `]
})
export class ArticleComponent implements OnInit {
  article: Article | null = null;
  renderedBody: SafeHtml = '';
  loading     = true;
  error       = '';
  commentText = '';
  posting     = false;
  readProgress = 0;

  constructor(
    public  auth:      AuthService,
    private api:       ApiService,
    private toast:     ToastService,
    private route:     ActivatedRoute,
    private router:    Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      if (p['id']) this.loadArticle(p['id']);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    this.readProgress = h > 0 ? Math.round((window.scrollY / h) * 100) : 0;
  }

  loadArticle(id: string) {
    this.loading = true;
    this.api.getArticle(id).subscribe({
      next: a => {
        this.article = a;
        this.renderedBody = this.sanitizer.bypassSecurityTrustHtml(
          this.renderMarkdown(a.body || '')
        );
        this.loading = false;
        this.api.incrementRead(id).subscribe();
      },
      error: e => { this.error = e.message; this.loading = false; }
    });
  }

  // ── FIXED MARKDOWN RENDERER ────────────────────────────────
  // Key fixes:
  //   1. Escape HTML ONLY in text nodes, never in already-processed HTML
  //   2. Process code blocks FIRST (before anything else touches backticks)
  //   3. Use a placeholder system so code content is never re-processed
  //   4. Emoji and unicode pass through untouched
  //   5. Heading regex is ^## not /[#]/g  — so # inside text is never stripped
  renderMarkdown(raw: string): string {
    if (!raw) return '';

    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];

    // ── Step 1: Extract fenced code blocks → placeholder ──
    let text = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = this.escapeHtml(code.trimEnd());
      const cls = lang ? ` class="language-${lang}"` : '';
      codeBlocks.push(`<pre><code${cls}>${escaped}</code></pre>`);
      return `\x00CODE${codeBlocks.length - 1}\x00`;
    });

    // ── Step 2: Extract inline code → placeholder ──
    text = text.replace(/`([^`\n]+)`/g, (_, code) => {
      inlineCodes.push(`<code>${this.escapeHtml(code)}</code>`);
      return `\x00INLINE${inlineCodes.length - 1}\x00`;
    });

    // ── Step 3: Escape HTML in the remaining plain text only ──
    // We escape < and > but NOT & (already handled) and preserve emoji
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // ── Step 4: Block-level elements ──
    // Headings (must be at start of line)
    text = text.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    text = text.replace(/^### (.+)$/gm,  '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm,   '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm,    '<h1>$1</h1>');

    // Blockquotes
    text = text.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    text = text.replace(/^---+$/gm, '<hr>');

    // Unordered lists — collect consecutive lines
    text = text.replace(/((?:^[-*+] .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n')
        .map(l => `<li>${l.replace(/^[-*+] /, '')}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    });

    // Ordered lists
    text = text.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n')
        .map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`)
        .join('');
      return `<ol>${items}</ol>`;
    });

    // ── Step 5: Inline formatting ──
    // Bold + italic (***text***)
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g,      '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_\n]+?)_/g,   '<em>$1</em>');
    // Strikethrough
    text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Images (markdown image syntax)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0;">');

    // ── Step 6: Paragraphs ──
    // Split on double newlines, wrap non-block-element lines in <p>
    const blockTags = /^<(h[1-6]|ul|ol|li|blockquote|pre|hr|img)/;
    text = text.split(/\n\n+/)
      .map(chunk => {
        chunk = chunk.trim();
        if (!chunk) return '';
        if (blockTags.test(chunk)) return chunk;
        // Single newlines inside a paragraph → <br>
        return '<p>' + chunk.replace(/\n/g, '<br>') + '</p>';
      })
      .filter(Boolean)
      .join('\n');

    // ── Step 7: Restore placeholders ──
    text = text.replace(/\x00CODE(\d+)\x00/g,   (_, i) => codeBlocks[+i]);
    text = text.replace(/\x00INLINE(\d+)\x00/g, (_, i) => inlineCodes[+i]);

    return text;
  }

  /** Escape HTML special chars — but NEVER touch emoji or unicode */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Helpers ───────────────────────────────────────────────
  parseTags(tags: string): string[] {
    return (tags || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  readTime(body: string): string {
    const w = (body || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(w / 200)) + ' min read';
  }

  canDelete(): boolean {
    if (!this.article || !this.auth.isLoggedIn()) return false;
    return this.auth.isAdmin() ||
           this.article.authorId === this.auth.getUserId();
  }

  onImgError(event: Event) {
    // If cover image fails to load, hide it so emoji fallback shows
    (event.target as HTMLImageElement).style.display = 'none';
  }

  // ── Actions ───────────────────────────────────────────────
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
      next: updated => {
        this.article = updated;
        this.commentText = '';
        this.posting = false;
      },
      error: () => { this.toast.error('Failed to post comment.'); this.posting = false; }
    });
  }

  focusComment() { document.getElementById('cmt-ta')?.focus(); }

  copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => this.toast.success('Link copied!'));
  }

  deleteArticle() {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    this.api.deleteArticle(this.article!.id).subscribe({
      next: () => { this.toast.error('Article deleted.'); this.router.navigate(['/feed']); }
    });
  }
}
