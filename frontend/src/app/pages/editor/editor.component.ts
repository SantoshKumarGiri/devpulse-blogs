import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Article, ArticleDto } from '../../models/article.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ed-wrap">
      <div class="ed-top">
        <div class="ed-lbl">{{ editingId ? 'Edit Article' : 'New Article' }}</div>
        <div class="ed-acts">
          <span class="wc">{{ wordCount }} words · ~{{ readMinutes }}min</span>
          <button class="sdb" (click)="saveDraft()" [disabled]="saving">
            {{ saving ? 'Saving…' : 'Save draft' }}
          </button>
          <button class="pub" (click)="publish()" [disabled]="publishing">
            {{ publishing ? 'Publishing…' : 'Publish →' }}
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="tb">
        <button class="tbtn" (click)="wrap('**','**')"><b>B</b></button>
        <button class="tbtn" (click)="wrap('*','*')"><i>I</i></button>
        <button class="tbtn" (click)="insH('## ')">H2</button>
        <button class="tbtn" (click)="insH('### ')">H3</button>
        <span class="tsep"></span>
        <button class="tbtn" (click)="ins('- item\n- item\n- item')">• List</button>
        <button class="tbtn" (click)="ins('1. First\n2. Second\n3. Third')">1. List</button>
        <span class="tsep"></span>
        <button class="tbtn mono" (click)="ins('\`\`\`\ncode here\n\`\`\`')">&#123; &#125;</button>
        <button class="tbtn" (click)="ins('> Your quote here')">❝ Quote</button>
        <span class="tsep"></span>
        <button class="tbtn" (click)="ins('[link text](https://url.com)')">🔗 Link</button>
      </div>

      <!-- Cover emoji picker -->
      <div class="cdrop" (click)="syncCover()">
        <span [style.font-size]="coverEmoji ? '38px' : '20px'">{{ coverEmoji || '🖼' }}</span>
        <span>{{ coverEmoji ? 'Click to change' : 'Click to pick cover icon' }}</span>
      </div>

      <input class="et" type="text" placeholder="Your article title…"
             [(ngModel)]="title" (ngModelChange)="updateWC()">
      <input class="es" type="text" placeholder="A subtitle or TL;DR…" [(ngModel)]="subtitle">

      <textarea id="ed-body" class="eb"
                placeholder="Tell your story…&#10;&#10;Markdown supported:&#10;## Heading&#10;**bold**, *italic*&#10;> blockquote&#10;\`inline code\`&#10;\`\`\`&#10;code block&#10;\`\`\`"
                [(ngModel)]="body" (ngModelChange)="updateWC()"></textarea>

      <div class="ed-foot">
        <input class="et-tags" type="text" placeholder="Tags: Kubernetes, Docker, CI/CD (comma separated)"
               [(ngModel)]="tags">
        <select [(ngModel)]="coverEmoji">
          <option value="📝">📝 Default</option>
          <option value="🐳">🐳 Docker</option>
          <option value="☸️">☸️ Kubernetes</option>
          <option value="⚙️">⚙️ CI/CD</option>
          <option value="🏗️">🏗️ Terraform</option>
          <option value="📊">📊 Observability</option>
          <option value="🚀">🚀 GitOps</option>
          <option value="☁️">☁️ Cloud</option>
          <option value="🔐">🔐 Security</option>
          <option value="🔥">🔥 Hot Take</option>
          <option value="🧠">🧠 Deep Dive</option>
          <option value="💡">💡 Tips</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .ed-wrap { max-width:800px; margin:0 auto; padding:2rem 2rem 4rem; }
    .ed-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
    .ed-lbl { font-size:13px; color:var(--text3); }
    .ed-acts { display:flex; gap:8px; align-items:center; }
    .wc { font-size:12px; color:var(--text3); padding:4px 10px; }
    .sdb { background:none; border:1px solid var(--border2); color:var(--text2); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 18px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .sdb:hover:not(:disabled) { border-color:var(--text); color:var(--text); }
    .pub { background:var(--accent); color:#0d0d0d; border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:7px 22px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .pub:hover:not(:disabled) { background:var(--accent2); }
    .pub:disabled,.sdb:disabled { opacity:.6; cursor:not-allowed; }
    .tb { display:flex; align-items:center; gap:6px; padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:var(--r2); margin-bottom:1.25rem; flex-wrap:wrap; }
    .tbtn { background:none; border:1px solid var(--border); color:var(--text2); padding:5px 11px; border-radius:6px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; transition:all .15s; white-space:nowrap; }
    .tbtn:hover { background:var(--bg4); color:var(--text); border-color:var(--border2); }
    .tbtn.mono { font-family:'JetBrains Mono',monospace; }
    .tsep { width:1px; height:20px; background:var(--border2); flex-shrink:0; }
    .cdrop { background:var(--bg3); border:2px dashed var(--border2); border-radius:var(--r2); height:100px; display:flex; align-items:center; justify-content:center; color:var(--text3); font-size:14px; cursor:pointer; margin-bottom:1.5rem; gap:10px; transition:all .15s; }
    .cdrop:hover { border-color:var(--accent); color:var(--accent); }
    .et { background:none; border:none; color:var(--text); font-family:'Playfair Display',serif; font-size:38px; font-weight:700; width:100%; outline:none; padding:0 0 10px; line-height:1.15; border-bottom:1px solid var(--border); margin-bottom:14px; display:block; }
    .et::placeholder { color:var(--text3); }
    .es { background:none; border:none; color:var(--text2); font-family:'Playfair Display',serif; font-style:italic; font-size:19px; width:100%; outline:none; padding:0 0 1rem; border-bottom:1px solid var(--border); margin-bottom:1.5rem; display:block; }
    .es::placeholder { color:var(--text3); }
    .eb { background:none; border:none; color:var(--text); font-family:'DM Sans',sans-serif; font-size:17px; line-height:1.8; width:100%; min-height:420px; outline:none; resize:vertical; padding:0; display:block; }
    .eb::placeholder { color:var(--text3); }
    .ed-foot { display:flex; align-items:center; gap:12px; margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid var(--border); flex-wrap:wrap; }
    .et-tags { background:var(--bg3); border:1px solid var(--border); color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 16px; border-radius:20px; outline:none; flex:1; min-width:180px; }
    .et-tags::placeholder { color:var(--text3); }
    select { background:var(--bg3); border:1px solid var(--border); color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 14px; border-radius:20px; outline:none; }
    @media(max-width:750px) { .et { font-size:26px; } }
  `]
})
export class EditorComponent implements OnInit {
  editingId: string | null = null;
  title = '';
  subtitle = '';
  body = '';
  tags = '';
  coverEmoji = '📝';
  saving = false;
  publishing = false;

  get wordCount(): number {
    return (this.title + ' ' + this.body).trim().split(/\s+/).filter(Boolean).length;
  }
  get readMinutes(): number {
    return Math.max(1, Math.ceil(this.wordCount / 200));
  }

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((p: Params) => {
      if (p['id']) this.loadExisting(p['id'] as string);
    });
  }

  loadExisting(id: string) {
    this.editingId = id;
    this.api.getArticle(id).subscribe({
      next: (a: Article) => {
        this.title = a.title || '';
        this.subtitle = a.subtitle || '';
        this.body = a.body || '';
        this.tags = a.tags || '';
        this.coverEmoji = a.emoji || '📝';
      }
    });
  }

  buildDto(isDraft: boolean): ArticleDto {
    return { title: this.title, subtitle: this.subtitle, body: this.body, tags: this.tags, emoji: this.coverEmoji, draft: isDraft };
  }

  saveDraft() {
    if (!this.title && !this.body) { this.toast.error('Nothing to save.'); return; }
    this.saving = true;
    const req = this.editingId
      ? this.api.updateArticle(this.editingId, this.buildDto(true))
      : this.api.createArticle(this.buildDto(true));
    req.subscribe({
      next: (saved: Article) => {
        this.editingId = saved.id;
        this.saving = false;
        this.toast.success('✓ Draft saved!');
        this.router.navigate(['/editor', saved.id], { replaceUrl: true });
      },
      error: (e: Error) => { this.saving = false; this.toast.error(e.message); }
    });
  }

  publish() {
    if (!this.title) { this.toast.error('Please add a title.'); return; }
    if (!this.body)  { this.toast.error('Please write some content.'); return; }
    this.publishing = true;
    const req = this.editingId
      ? this.api.updateArticle(this.editingId, this.buildDto(false))
      : this.api.createArticle(this.buildDto(false));
    req.subscribe({
      next: (saved: Article) => {
        this.publishing = false;
        this.toast.success('🎉 Published!');
        this.router.navigate(['/article', saved.id]);
      },
      error: (e: Error) => { this.publishing = false; this.toast.error(e.message); }
    });
  }

  syncCover() { /* coverEmoji already bound via select ngModel */ }

  updateWC() { /* computed via getter */ }

  wrap(before: string, after: string) {
    const ta = document.getElementById('ed-body') as HTMLTextAreaElement;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || 'text';
    this.body = ta.value.slice(0,s) + before + sel + after + ta.value.slice(e);
  }

  insH(prefix: string) {
    const ta = document.getElementById('ed-body') as HTMLTextAreaElement;
    const s = ta.selectionStart;
    const before = this.body.slice(0, s);
    this.body = before + (before.length && !before.endsWith('\n') ? '\n' : '') + prefix + 'Heading\n' + this.body.slice(s);
  }

  ins(text: string) {
    const ta = document.getElementById('ed-body') as HTMLTextAreaElement;
    const s = ta.selectionStart;
    const before = this.body.slice(0, s);
    this.body = before + (before.length && !before.endsWith('\n') ? '\n\n' : '') + text + '\n\n' + this.body.slice(s);
  }
} 


