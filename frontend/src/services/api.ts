import type {
  Movie,
  Product,
  RecommendationResponse,
  AuthResponse,
  Rating,
  UserSignal,
  AlgorithmStatusResponse,
  AnalyticsOverviewResponse,
} from '../types';

const API_BASE = '/api';

function getGuestId(): string {
  let guestId = localStorage.getItem('cinetech_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('cinetech_guest_id', guestId);
  }
  return guestId;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Guest-Id': getGuestId(),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid credentials' }));
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(() => {});
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  // Movies
  async getMovies(params?: {
    query?: string;
    genre?: string;
    minRating?: number;
    minYear?: number;
    sortBy?: string;
  }): Promise<Movie[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.genre) searchParams.append('genre', params.genre);
    if (params?.minRating) searchParams.append('minRating', params.minRating.toString());
    if (params?.minYear) searchParams.append('minYear', params.minYear.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/movies?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  },

  async getMovieById(id: string): Promise<Movie> {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Movie not found');
    return res.json();
  },

  async getTrendingMovies(limit = 10): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/movies/trending?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch trending movies');
    return res.json();
  },

  async getRecommendedMovies(limit = 10): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/movies/recommended?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to calculate movie recommendations');
    return res.json();
  },

  async getSimilarMovies(id: string, limit = 6): Promise<Movie[]> {
    const res = await fetch(`${API_BASE}/movies/${id}/similar?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch similar movies');
    return res.json();
  },

  async getMovieGenres(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/movies/genres`);
    if (!res.ok) return [];
    return res.json();
  },

  // Products
  async getProducts(params?: {
    query?: string;
    category?: string;
    minRating?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.minRating) searchParams.append('minRating', params.minRating.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    const res = await fetch(`${API_BASE}/products?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async getTrendingProducts(limit = 10): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/trending?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch trending products');
    return res.json();
  },

  async getRecommendedProducts(limit = 10): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/products/recommended?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to calculate product recommendations');
    return res.json();
  },

  async getSimilarProducts(id: string, limit = 6): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/${id}/similar?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch similar products');
    return res.json();
  },

  async getProductCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/products/categories`);
    if (!res.ok) return [];
    return res.json();
  },

  // Ratings
  async rateItem(itemType: 'MOVIE' | 'PRODUCT', itemId: string, ratingValue: number, comment = ''): Promise<Rating> {
    const res = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemType, itemId, ratingValue, comment }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Rating failed' }));
      throw new Error(err.error || 'Failed to submit rating');
    }
    const data = await res.json();
    window.dispatchEvent(new CustomEvent('recommendations-updated', { detail: { itemType, itemId, ratingValue } }));
    return data;
  },

  async getMyRatings(): Promise<Rating[]> {
    const res = await fetch(`${API_BASE}/ratings/my`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch ratings');
    return res.json();
  },

  async getItemRatings(itemType: 'MOVIE' | 'PRODUCT', itemId: string): Promise<Rating[]> {
    const res = await fetch(`${API_BASE}/ratings/item/${itemType}/${itemId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async deleteRating(ratingId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/ratings/${ratingId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  // User Signals & History
  async recordSearch(itemType: 'MOVIE' | 'PRODUCT' | 'ALL', query: string): Promise<void> {
    await fetch(`${API_BASE}/signals/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemType, query }),
    }).catch(() => {});
  },

  async getUserHistory(): Promise<UserSignal[]> {
    const res = await fetch(`${API_BASE}/signals/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async deleteHistoryItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/signals/history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  async clearUserHistory(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/signals/history/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  // Algorithms Telemetry
  async getAlgorithmStatus(): Promise<AlgorithmStatusResponse> {
    const res = await fetch(`${API_BASE}/algorithms/status`);
    if (!res.ok) throw new Error('Failed to retrieve algorithms telemetry');
    return res.json();
  },

  // Analytics & Insights
  async getAnalyticsOverview(): Promise<AnalyticsOverviewResponse> {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve analytics overview');
    return res.json();
  },
};
