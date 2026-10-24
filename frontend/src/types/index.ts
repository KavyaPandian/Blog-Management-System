export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  category: Category | null;
  comments_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  post: number;
  author: User;
  content: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface DashboardData {
  total_posts: number;
  total_comments: number;
  total_likes: number;
  my_posts: number;
  my_comments: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
