import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Article, ArticleDto,
  AuthResponse, LoginRequest, RegisterRequest
} from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('devpulse_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // NOTE: Do NOT set Content-Type for multipart — browser sets it with boundary automatically
  private multipartHeaders(): HttpHeaders {
    const token = localStorage.getItem('devpulse_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private err(e: any): Observable<never> {
    const msg = e?.error?.error || e?.message || 'Something went wrong';
    return throwError(() => new Error(msg));
  }

  // ── Auth ──────────────────────────────────────────────────
  login(p: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/login`, p)
      .pipe(catchError(e => this.err(e)));
  }

  register(p: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/register`, p)
      .pipe(catchError(e => this.err(e)));
  }

  me(): Observable<any> {
    return this.http.get<any>(`${this.base}/api/auth/me`, { headers: this.headers() })
      .pipe(catchError(e => this.err(e)));
  }

  // ── Articles ──────────────────────────────────────────────
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles`)
      .pipe(catchError(e => this.err(e)));
  }

  getDrafts(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles/drafts`,
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  getBookmarks(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles/bookmarks`,
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/api/articles/${id}`)
      .pipe(catchError(e => this.err(e)));
  }

  search(q: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/articles/search`,
      { params: new HttpParams().set('q', q) })
      .pipe(catchError(e => this.err(e)));
  }

  createArticle(dto: ArticleDto & { coverImageUrl?: string }): Observable<Article> {
    return this.http.post<Article>(`${this.base}/api/articles`, dto,
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  updateArticle(id: string, dto: ArticleDto & { coverImageUrl?: string }): Observable<Article> {
    return this.http.put<Article>(`${this.base}/api/articles/${id}`, dto,
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.base}/api/articles/${id}`,
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  incrementRead(id: string): Observable<any> {
    return this.http.patch(`${this.base}/api/articles/${id}/read`, {})
      .pipe(catchError(e => this.err(e)));
  }

  toggleLike(id: string): Observable<{ liked: boolean; likes: number }> {
    return this.http.patch<any>(`${this.base}/api/articles/${id}/like`, {},
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  toggleBookmark(id: string): Observable<{ bookmarked: boolean }> {
    return this.http.patch<any>(`${this.base}/api/articles/${id}/bookmark`, {},
      { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  addComment(id: string, text: string): Observable<Article> {
    return this.http.post<Article>(`${this.base}/api/articles/${id}/comments`,
      { text }, { headers: this.headers() }).pipe(catchError(e => this.err(e)));
  }

  // ── Image upload ──────────────────────────────────────────
  uploadCoverImage(formData: FormData): Observable<{ url: string; method: string }> {
    return this.http.post<{ url: string; method: string }>(
      `${this.base}/api/images/upload`,
      formData,
      { headers: this.multipartHeaders() }   // no Content-Type override — browser sets multipart boundary
    ).pipe(catchError(e => this.err(e)));
  }

  // ── Users ─────────────────────────────────────────────────
  getAuthorProfile(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/api/users/${id}/public`)
      .pipe(catchError(e => this.err(e)));
  }

  getAuthorArticles(id: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.base}/api/users/${id}/articles`)
      .pipe(catchError(e => this.err(e)));
  }
}
