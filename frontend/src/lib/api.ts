import {
  AuthTokens,
  Category,
  Comment,
  DashboardData,
  PaginatedResponse,
  Post,
  User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// Token Storage Helpers
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("blog_access_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("blog_refresh_token");
};

export const setTokens = (tokens: AuthTokens) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("blog_access_token", tokens.access);
  localStorage.setItem("blog_refresh_token", tokens.refresh);
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("blog_access_token");
  localStorage.removeItem("blog_refresh_token");
  localStorage.removeItem("blog_user");
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("blog_user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("blog_user", JSON.stringify(user));
};

// Parse JWT Token Payload
export const parseJwt = (token: string): { user_id?: number; username?: string; exp?: number } | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Core Fetch Client with automatic token injection and refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Expiration (401)
  if (response.status === 401 && token) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/api/auth/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newAccess = data.access;
            const newRefresh = data.refresh || refreshToken;
            setTokens({ access: newAccess, refresh: newRefresh });
            onRefreshed(newAccess);
            isRefreshing = false;

            // Retry original request with new token
            headers.set("Authorization", `Bearer ${newAccess}`);
            response = await fetch(url, { ...options, headers });
          } else {
            clearTokens();
            isRefreshing = false;
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("auth-changed"));
            }
          }
        } catch {
          clearTokens();
          isRefreshing = false;
        }
      } else {
        // Wait for active refresh
        const retryToken = await new Promise<string>((resolve) => {
          subscribeTokenRefresh((newToken) => resolve(newToken));
        });
        headers.set("Authorization", `Bearer ${retryToken}`);
        response = await fetch(url, { ...options, headers });
      }
    }
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.detail ||
      data?.message ||
      (typeof data === "object" && data !== null
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
            .join(" | ")
        : "An unexpected error occurred");
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API Calls
export const api = {
  login: async (credentials: { username: string; password: string }): Promise<AuthTokens> => {
    return apiRequest<AuthTokens>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: { username: string; email?: string; password: string }): Promise<User> => {
    return apiRequest<User>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Posts API Calls
  getPosts: async (params?: {
    page?: number;
    search?: string;
    category?: number | string;
    ordering?: string;
    author?: number | string;
  }): Promise<PaginatedResponse<Post>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category.toString());
    if (params?.author) query.set("author", params.author.toString());
    if (params?.ordering) query.set("ordering", params.ordering);

    const queryString = query.toString();
    return apiRequest<PaginatedResponse<Post>>(
      `/api/posts/${queryString ? `?${queryString}` : ""}`
    );
  },

  getPost: async (id: number | string): Promise<Post> => {
    return apiRequest<Post>(`/api/posts/${id}/`);
  },

  createPost: async (postData: {
    title: string;
    content: string;
    category_id?: number | null;
  }): Promise<Post> => {
    return apiRequest<Post>("/api/posts/", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (
    id: number | string,
    postData: {
      title?: string;
      content?: string;
      category_id?: number | null;
    }
  ): Promise<Post> => {
    return apiRequest<Post>(`/api/posts/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id: number | string): Promise<void> => {
    return apiRequest<void>(`/api/posts/${id}/`, {
      method: "DELETE",
    });
  },

  likePost: async (id: number | string): Promise<{ message: string; likes_count: number }> => {
    return apiRequest<{ message: string; likes_count: number }>(`/api/posts/${id}/like/`, {
      method: "POST",
    });
  },

  unlikePost: async (id: number | string): Promise<{ message: string; likes_count: number }> => {
    return apiRequest<{ message: string; likes_count: number }>(`/api/posts/${id}/unlike/`, {
      method: "POST",
    });
  },

  // Comments API Calls
  getComments: async (postId: number | string): Promise<PaginatedResponse<Comment> | Comment[]> => {
    return apiRequest<PaginatedResponse<Comment> | Comment[]>(`/api/posts/${postId}/comments/`);
  },

  addComment: async (postId: number | string, content: string): Promise<Comment> => {
    return apiRequest<Comment>(`/api/posts/${postId}/comments/`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  deleteComment: async (commentId: number | string): Promise<void> => {
    return apiRequest<void>(`/api/comments/${commentId}/`, {
      method: "DELETE",
    });
  },

  // Categories API Calls
  getCategories: async (): Promise<PaginatedResponse<Category> | Category[]> => {
    return apiRequest<PaginatedResponse<Category> | Category[]>("/api/categories/");
  },

  createCategory: async (data: { name: string; description: string }): Promise<Category> => {
    return apiRequest<Category>("/api/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Dashboard Stats
  getDashboard: async (): Promise<DashboardData> => {
    return apiRequest<DashboardData>("/api/dashboard/");
  },
};
