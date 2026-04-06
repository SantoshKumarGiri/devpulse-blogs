export interface Comment {
  name: string;
  initials: string;
  text: string;
  ts: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  tags: string;
  emoji: string;
  draft: boolean;
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  reads: number;
  comments: Comment[];
  authorId?: string;
  authorName?: string;
  authorInitials?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDto {
  title: string;
  subtitle: string;
  body: string;
  tags: string;
  emoji: string;
  draft: boolean;
}

export interface LoginRequest {
  email?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AUTHOR' | 'USER';
  avatarInitials: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}
