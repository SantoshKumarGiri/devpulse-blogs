import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ArticleDto } from '../../models/article.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ed-wrap">

      <!-- Top bar -->
      <div class="ed-top">
        <div class="ed-lbl">{{ editingId ? 'Edit Article' : 'New Article' }}</div>
        <div class="ed-acts">
          <span class="wc">{{ wordCount }} words · ~{{ readMinutes }} min</span>
          <button class="sdb" (click)="saveDraft()" [disabled]="saving">
            {{ saving ? 'Saving…' : 'Save draft' }}
          </button>
          <button class="pub" (click)="publish()" [disabled]="publishing">
            {{ publishing ? 'Publishing…' : 'Publish →' }}
          </button>
        </div>
      </div>

      <!-- Formatting toolbar -->
      <div class="tb">
        <button class="tbtn" title="Bold"       (click)="wrap('**','**')"><b>B</b></button>
        <button class="tbtn" title="Italic"     (click)="wrap('*','*')"><i>I</i></button>
        <button class="tbtn" title="Heading 2"  (click)="insH('## ')">H2</button>
        <button class="tbtn" title="Heading 3"  (click)="insH('### ')">H3</button>
        <span class="tsep"></span>
        <button class="tbtn" title="Bullet list"  (click)="ins('- item\n- item\n- item')">• List</button>
        <button class="tbtn" title="Ordered list" (click)="ins('1. First\n2. Second\n3. Third')">1. List</button>
        <span class="tsep"></span>
        <button class="tbtn mono" title="Code block" (click)="ins('\u0060\u0060\u0060\ncode here\n\u0060\u0060\u0060')">&lt;/&gt;</button>
        <button class="tbtn" title="Blockquote"  (click)="ins('> Your quote here')">❝</button>
        <button class="tbtn" title="Divider"     (click)="ins('---')">—</button>
        <span class="tsep"></span>
        <button class="tbtn" title="Link"  (click)="ins('[link text](https://url.com)')">🔗</button>
        <button class="tbtn" title="Image from URL" (click)="insertImageUrl()">🖼 URL</button>
        <button class="tbtn img-upload-btn" title="Upload image from computer" (click)="triggerImageUpload()">
          📁 Upload
        </button>
        <!-- Hidden file input for image uploads -->
        <input #imageInput
               type="file"
               accept="image/*"
               style="display:none"
               (change)="onImageFileSelected($event)">
      </div>

      <!-- Cover image area -->
      <div class="cover-area">
        <!-- Show uploaded/URL cover image -->
        <div class="cover-preview" *ngIf="coverImageUrl || coverImagePreview">
          <img [src]="coverImagePreview || coverImageUrl" alt="Cover" class="cover-prev-img">
          <button class="remove-cover" (click)="removeCover()" title="Remove cover">✕</button>
        </div>

        <!-- Show emoji cover when no image -->
        <div class="cover-emoji-area" *ngIf="!coverImageUrl && !coverImagePreview">
          <div class="cdrop" (click)="syncCover()">
            <span [style.font-size]="coverEmoji ? '38px' : '20px'">
              {{ coverEmoji || '🖼' }}
            </span>
            <span class="cdrop-hint">
              {{ coverEmoji ? 'Change icon below ↓' : 'Pick cover icon ↓  or  upload a photo above' }}
            </span>
          </div>
        </div>

        <!-- Image upload progress -->
        <div class="upload-progress" *ngIf="uploading">
          <div class="prog-bar" [style.width.%]="uploadProgress"></div>
          <span>Uploading image… {{ uploadProgress }}%</span>
        </div>
      </div>

      <!-- Cover image options row -->
      <div class="cover-opts">
        <button class="cover-opt-btn" (click)="triggerImageUpload()">📁 Upload photo</button>
        <button class="cover-opt-btn" (click)="insertCoverFromUrl()">🔗 Image URL</button>
        <select [(ngModel)]="coverEmoji" (ngModelChange)="clearCoverImage()" class="emoji-sel" title="Cover emoji">
          <option value="">— or pick emoji —</option>
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
          <option value="🛡️">🛡️ SRE</option>
          <option value="📦">📦 Containers</option>
          <option value="🔄">🔄 CI/CD Pipeline</option>
        </select>
      </div>

      <!-- Title -->
      <input class="et"
             type="text"
             placeholder="Your article title…"
             [(ngModel)]="title"
             (ngModelChange)="updateWC()">

      <!-- Subtitle -->
      <input class="es"
             type="text"
             placeholder="A subtitle or TL;DR…"
             [(ngModel)]="subtitle">

      <!-- Body textarea -->
      <!-- paste event is handled to preserve emoji and special chars -->
      <textarea #bodyTextarea
                id="ed-body"
                class="eb"
                [(ngModel)]="body"
                (ngModelChange)="updateWC()"
                (paste)="onPaste($event)"
                (keydown.tab)="onTab($event)"
                placeholder="Tell your story…

Markdown supported:
## Heading 2
### Heading 3
**bold text**   *italic text*
> blockquote
\`inline code\`
\`\`\`
code block
\`\`\`
[link text](https://url.com)
---  (horizontal divider)

You can paste emoji, special characters, and symbols directly — they all work! 🚀🐳☸️"></textarea>

      <!-- Footer: tags + emoji -->
      <div class="ed-foot">
        <input class="et-tags"
               type="text"
               placeholder="Tags: Kubernetes, Docker, CI/CD  (comma separated)"
               [(ngModel)]="tags">
      </div>

      <!-- Tips bar -->
      <div class="tips-bar">
        <span>💡 Tips:</span>
        <span>Paste emoji directly ✓</span>
        <span>•</span>
        <span>Use \`\`\` for code blocks ✓</span>
        <span>•</span>
        <span>Upload or link a cover photo above ✓</span>
      </div>

    </div>
  `,
  styles: [`
    .ed-wrap { max-width:820px; margin:0 auto; padding:2rem 2rem 4rem; }
    .ed-top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:10px; }
    .ed-lbl  { font-size:13px; color:var(--text3,#6b6660); }
    .ed-acts { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .wc   { font-size:12px; color:var(--text3,#6b6660); padding:4px 10px; }
    .sdb  { background:none; border:1px solid rgba(255,255,255,.14); color:var(--text2,#9e9991); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 18px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .sdb:hover:not(:disabled) { border-color:var(--text,#f0ede8); color:var(--text,#f0ede8); }
    .pub  { background:#e8d5a3; color:#0d0d0d; border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:7px 22px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .pub:hover:not(:disabled) { background:#c4a96b; }
    .pub:disabled,.sdb:disabled { opacity:.6; cursor:not-allowed; }

    /* Toolbar */
    .tb   { display:flex; align-items:center; gap:6px; padding:10px 14px; background:#1e1e1e; border:1px solid rgba(255,255,255,.08); border-radius:14px; margin-bottom:1rem; flex-wrap:wrap; }
    .tbtn { background:none; border:1px solid rgba(255,255,255,.08); color:var(--text2,#9e9991); padding:5px 11px; border-radius:6px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; transition:all .15s; white-space:nowrap; }
    .tbtn:hover { background:#222; color:var(--text,#f0ede8); border-color:rgba(255,255,255,.14); }
    .tbtn.mono { font-family:'JetBrains Mono',monospace; }
    .tsep { width:1px; height:20px; background:rgba(255,255,255,.14); flex-shrink:0; }

    /* Cover area */
    .cover-area { margin-bottom:10px; }
    .cover-preview { position:relative; width:100%; height:220px; border-radius:14px; overflow:hidden; margin-bottom:0; }
    .cover-prev-img { width:100%; height:100%; object-fit:cover; display:block; }
    .remove-cover { position:absolute; top:10px; right:10px; background:rgba(0,0,0,.6); color:#fff; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
    .cover-emoji-area { }
    .cdrop { background:#1a1a1a; border:2px dashed rgba(255,255,255,.14); border-radius:14px; height:80px; display:flex; align-items:center; justify-content:center; color:var(--text3,#6b6660); cursor:pointer; gap:12px; transition:all .15s; }
    .cdrop:hover { border-color:#e8d5a3; color:#e8d5a3; }
    .cdrop-hint { font-size:13px; }
    .upload-progress { padding:10px 0; }
    .prog-bar { height:3px; background:#e8d5a3; border-radius:2px; transition:width .2s; margin-bottom:6px; }
    .upload-progress span { font-size:12px; color:var(--text3,#6b6660); }

    /* Cover options row */
    .cover-opts { display:flex; gap:8px; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; }
    .cover-opt-btn { background:none; border:1px solid rgba(255,255,255,.08); color:var(--text2,#9e9991); font-family:'DM Sans',sans-serif; font-size:12px; padding:5px 14px; border-radius:20px; cursor:pointer; transition:all .15s; }
    .cover-opt-btn:hover { border-color:rgba(255,255,255,.2); color:var(--text,#f0ede8); }
    .emoji-sel { background:#1a1a1a; border:1px solid rgba(255,255,255,.08); color:var(--text2,#9e9991); font-family:'DM Sans',sans-serif; font-size:13px; padding:5px 12px; border-radius:20px; outline:none; cursor:pointer; }

    /* Title / subtitle / body */
    .et  { background:none; border:none; color:var(--text,#f0ede8); font-family:'Playfair Display',serif; font-size:36px; font-weight:700; width:100%; outline:none; padding:0 0 10px; line-height:1.15; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:14px; display:block; }
    .et::placeholder  { color:var(--text3,#6b6660); }
    .es  { background:none; border:none; color:var(--text2,#9e9991); font-family:'Playfair Display',serif; font-style:italic; font-size:19px; width:100%; outline:none; padding:0 0 1rem; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:1.5rem; display:block; }
    .es::placeholder  { color:var(--text3,#6b6660); }
    .eb  { background:none; border:none; color:var(--text,#f0ede8); font-family:'DM Sans',sans-serif; font-size:17px; line-height:1.8; width:100%; min-height:500px; outline:none; resize:vertical; padding:0; display:block;
           /* Preserve whitespace and line breaks correctly */
           white-space: pre-wrap; }
    .eb::placeholder  { color:var(--text3,#6b6660); white-space:pre-wrap; }

    /* Footer */
    .ed-foot { display:flex; align-items:center; gap:12px; margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,.08); flex-wrap:wrap; }
    .et-tags { background:#1a1a1a; border:1px solid rgba(255,255,255,.08); color:var(--text,#f0ede8); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 16px; border-radius:20px; outline:none; flex:1; min-width:180px; }
    .et-tags::placeholder { color:var(--text3,#6b6660); }

    /* Tips */
    .tips-bar { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:1rem; padding:8px 14px; background:#1a1a1a; border-radius:10px; font-size:12px; color:var(--text3,#6b6660); }
    .tips-bar span:first-child { color:#e8d5a3; font-weight:500; }

    @media(max-width:750px) { .et { font-size:26px; } }
  `]
})
export class EditorComponent implements OnInit {

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bodyTextarea') bodyTextarea!: ElementRef<HTMLTextAreaElement>;

  editingId:        string | null = null;
  title             = '';
  subtitle          = '';
  body              = '';
  tags              = '';
  coverEmoji        = '📝';
  coverImageUrl     = '';    // URL stored in DB
  coverImagePreview = '';    // local blob preview before upload
  uploading         = false;
  uploadProgress    = 0;
  saving            = false;
  publishing        = false;

  get wordCount(): number {
    return (this.title + ' ' + this.body).trim().split(/\s+/).filter(Boolean).length;
  }
  get readMinutes(): number {
    return Math.max(1, Math.ceil(this.wordCount / 200));
  }

  constructor(
    private api:   ApiService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      if (p['id']) this.loadExisting(p['id']);
    });
  }

  loadExisting(id: string) {
    this.editingId = id;
    this.api.getArticle(id).subscribe({
      next: a => {
        this.title         = a.title         || '';
        this.subtitle      = a.subtitle      || '';
        this.body          = a.body          || '';
        this.tags          = a.tags          || '';
        this.coverEmoji    = a.emoji         || '📝';
        this.coverImageUrl = (a as any).coverImageUrl || '';
      }
    });
  }

  // ── IMAGE UPLOAD ──────────────────────────────────────────

  triggerImageUpload() {
    this.imageInput.nativeElement.click();
  }

  onImageFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Image must be under 5MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverImagePreview = e.target?.result as string;
      this.coverEmoji = '';  // clear emoji if image selected
    };
    reader.readAsDataURL(file);

    // Upload to backend
    this.uploadImage(file);

    // Reset input so same file can be selected again
    (event.target as HTMLInputElement).value = '';
  }

  uploadImage(file: File) {
    this.uploading       = true;
    this.uploadProgress  = 0;

    const formData = new FormData();
    formData.append('image', file);

    // Simulate progress (real progress needs HttpRequest with reportProgress)
    const interval = setInterval(() => {
      if (this.uploadProgress < 85) this.uploadProgress += 15;
    }, 200);

    this.api.uploadCoverImage(formData).subscribe({
      next: (res: any) => {
        clearInterval(interval);
        this.uploadProgress  = 100;
        this.coverImageUrl   = res.url;
        this.coverImagePreview = res.url;  // use real URL
        this.uploading = false;
        this.toast.success('✓ Cover image uploaded!');
      },
      error: (e) => {
        clearInterval(interval);
        this.uploading = false;
        // If upload endpoint not set up yet, keep the local preview and store as base64
        this.toast.info('Image stored locally — set up Cloudinary for permanent hosting');
        // coverImagePreview already set from FileReader — article will show it
      }
    });
  }

  insertCoverFromUrl() {
    const url = prompt('Paste the image URL:');
    if (!url?.trim()) return;
    this.coverImageUrl     = url.trim();
    this.coverImagePreview = url.trim();
    this.coverEmoji        = '';
    this.toast.success('Cover image set!');
  }

  removeCover() {
    this.coverImageUrl     = '';
    this.coverImagePreview = '';
    this.coverEmoji        = '📝';
  }

  clearCoverImage() {
    // When emoji is selected, clear any image
    if (this.coverEmoji) {
      this.coverImageUrl     = '';
      this.coverImagePreview = '';
    }
  }

  // Insert an image URL inline in the article body
  insertImageUrl() {
    const url = prompt('Paste image URL to insert in article:');
    if (!url?.trim()) return;
    const altText = prompt('Alt text (description of image):') || 'Image';
    this.ins(`![${altText}](${url.trim()})`);
  }

  syncCover() { /* emoji already two-way bound via ngModel */ }

  // ── PASTE HANDLER ─────────────────────────────────────────
  // Fix: preserve emoji, special chars, unicode from clipboard
  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Get plain text — this preserves emoji and special chars as-is
    // We explicitly do NOT use clipboardData.getData('text/html')
    // because that would bring in unwanted HTML tags
    const text = clipboardData.getData('text/plain');

    if (!text) return;

    const ta = this.bodyTextarea?.nativeElement ||
               document.getElementById('ed-body') as HTMLTextAreaElement;
    if (!ta) {
      this.body += text;
      return;
    }

    const start = ta.selectionStart;
    const end   = ta.selectionEnd;

    // Insert at cursor position
    this.body = this.body.slice(0, start) + text + this.body.slice(end);

    // Restore cursor after the pasted text
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
    });
  }

  // Handle Tab key — insert 2 spaces instead of losing focus
  onTab(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.ins('  ');
  }

  // ── FORM COLLECTION ───────────────────────────────────────

  buildDto(isDraft: boolean): ArticleDto & { coverImageUrl?: string } {
    return {
      title:    this.title.trim(),
      subtitle: this.subtitle.trim(),
      body:     this.body,          // preserve as-is, no trimming of internal content
      tags:     this.tags.trim(),
      emoji:    this.coverEmoji || '📝',
      draft:    isDraft,
      coverImageUrl: this.coverImageUrl || undefined
    };
  }

  saveDraft() {
    if (!this.title && !this.body) { this.toast.error('Nothing to save.'); return; }
    this.saving = true;
    const req = this.editingId
      ? this.api.updateArticle(this.editingId, this.buildDto(true))
      : this.api.createArticle(this.buildDto(true));
    req.subscribe({
      next: saved => {
        this.editingId = saved.id;
        this.saving    = false;
        this.toast.success('✓ Draft saved!');
        this.router.navigate(['/editor', saved.id], { replaceUrl: true });
      },
      error: e => { this.saving = false; this.toast.error(e.message); }
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
      next: saved => {
        this.publishing = false;
        this.toast.success('🎉 Published!');
        this.router.navigate(['/article', saved.id]);
      },
      error: e => { this.publishing = false; this.toast.error(e.message); }
    });
  }

  updateWC() { /* computed via getters */ }

  // ── TOOLBAR HELPERS ───────────────────────────────────────

  wrap(before: string, after: string) {
    const ta = document.getElementById('ed-body') as HTMLTextAreaElement;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const selected = this.body.slice(s, e) || 'text';
    this.body = this.body.slice(0, s) + before + selected + after + this.body.slice(e);
    requestAnimationFrame(() => {
      ta.selectionStart = s + before.length;
      ta.selectionEnd   = s + before.length + selected.length;
    });
  }

  insH(prefix: string) {
    const ta = document.getElementById('ed-body') as HTMLTextAreaElement;
    if (!ta) return;
    const s = ta.selectionStart;
    const before = this.body.slice(0, s);
    const nl = before.length && !before.endsWith('\n') ? '\n' : '';
    this.body = before + nl + prefix + 'Heading\n' + this.body.slice(s);
  }

  ins(text: string) {
    const ta = document.getElementById('ed-body') as HTMLTextAreaElement;
    if (!ta) return;
    const s = ta.selectionStart;
    const before = this.body.slice(0, s);
    const nl = before.length && !before.endsWith('\n') ? '\n\n' : '';
    this.body = before + nl + text + '\n\n' + this.body.slice(s);
    requestAnimationFrame(() => {
      const pos = s + nl.length + text.length + 2;
      ta.selectionStart = ta.selectionEnd = pos;
      ta.focus();
    });
  }
}
