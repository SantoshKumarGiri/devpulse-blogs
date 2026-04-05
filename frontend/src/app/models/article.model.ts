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
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}
