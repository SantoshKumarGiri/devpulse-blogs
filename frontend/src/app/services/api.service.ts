import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Article, ArticleDto, LoginRequest, LoginResponse } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('devpulse_token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private handle(err: any): Observable<never> {
    const msg = err?.error?.error || err?.message || 'Unknown error';
    return throwError(() => new Error(msg));
  }

  // ── AUTH ──────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/api/auth/login`, payload)
      .pipe(catchError(e => this.handle(e)));
  }

  me(): Observable<{ ok: boolean; admin: boolean }> {
    return this.http.get<any>(`${this.base}/api/auth/me`,
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  // ── ARTICLES ──────────────────────────────────────────────
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles`)
      .pipe(catchError(e => this.handle(e)));
  }

  getDrafts(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles/drafts`,
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  getBookmarks(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles/bookmarks`,
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/api/articles/${id}`)
      .pipe(catchError(e => this.handle(e)));
  }

  search(q: string): Observable<Article[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Article[]>(`${this.base}/api/articles/search`, { params })
      .pipe(catchError(e => this.handle(e)));
  }

  createArticle(dto: ArticleDto): Observable<Article> {
    return this.http.post<Article>(`${this.base}/api/articles`, dto,
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  updateArticle(id: string, dto: ArticleDto): Observable<Article> {
    return this.http.put<Article>(`${this.base}/api/articles/${id}`, dto,
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.base}/api/articles/${id}`,
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  incrementRead(id: string): Observable<any> {
    return this.http.patch(`${this.base}/api/articles/${id}/read`, {})
      .pipe(catchError(e => this.handle(e)));
  }

  toggleLike(id: string): Observable<{ liked: boolean; likes: number }> {
    return this.http.patch<any>(`${this.base}/api/articles/${id}/like`, {},
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  toggleBookmark(id: string): Observable<{ bookmarked: boolean }> {
    return this.http.patch<any>(`${this.base}/api/articles/${id}/bookmark`, {},
      { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }

  addComment(id: string, text: string): Observable<Article> {
    return this.http.post<Article>(`${this.base}/api/articles/${id}/comments`,
      { text }, { headers: this.authHeaders() })
      .pipe(catchError(e => this.handle(e)));
  }
}
