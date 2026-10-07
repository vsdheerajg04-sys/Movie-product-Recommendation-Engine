export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  director: string;
  cast: string[];
  rating: number;
  voteCount: number;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  durationMinutes: number;
  trendingScore: number;
  tags: string[];
  score?: number;
  rank?: number;
  matchReason?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
  trendingScore: number;
  tags: string[];
  score?: number;
  rank?: number;
  matchReason?: string;
}

export interface RecommendationItem {
  rank: number;
  score: number;
  itemType: 'MOVIE' | 'PRODUCT';
  id: string;
  titleOrName: string;
  subtitle: string;
  imageUrl: string;
  rating: number;
  matchReason: string;
  details: Record<string, any>;
  tags: string[];
}

export interface PipelineMetrics {
  pipelineType: string;
  totalExecutionTimeMicros: number;
  totalExecutionTimeMs: number;
  candidatesCount: number;
  rankedCount: number;
  stageTimesMicros: Record<string, number>;
  algorithmsExecuted: string[];
  parallelExecutionEnabled: boolean;
  parallelWorkerThreads: number;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
  metrics: PipelineMetrics;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  favoriteMovieGenres?: string[];
  favoriteProductCategories?: string[];
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  message: string;
}

export interface Rating {
  id: string;
  userId: string;
  itemType: 'MOVIE' | 'PRODUCT';
  itemId: string;
  ratingValue: number;
  comment: string;
  timestamp: string;
}

export interface UserSignal {
  id: string;
  userId: string;
  itemType: 'MOVIE' | 'PRODUCT';
  signalType: 'SEARCH' | 'VIEW' | 'RATE' | 'CLICK';
  itemId?: string;
  query?: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

export interface AlgorithmInfo {
  id: number;
  name: string;
  package: string;
  techniques: string[];
  status: string;
}

export interface AlgorithmStatusResponse {
  engine: string;
  version: string;
  algorithmsCount: number;
  algorithms: AlgorithmInfo[];
  pipelineSequence: string[];
}

export interface AlgorithmBenchmark {
  name: string;
  complexity: string;
  avgLatencyUs: number;
  role: string;
}

export interface UserInsights {
  userId?: string;
  movieRatingsCount?: number;
  productRatingsCount?: number;
  totalInteractions?: number;
  userAverageRating?: number;
  topAffinityGenre?: string;
  topAffinityCategory?: string;
  genreAffinityBreakdown?: Record<string, number>;
  categoryAffinityBreakdown?: Record<string, number>;
}

export interface AnalyticsOverviewResponse {
  systemHealth: string;
  parallelWorkerThreads: number;
  totalMovies: number;
  totalProducts: number;
  totalRatings: number;
  totalUserSignals: number;
  avgMovieRating: number;
  avgProductRating: number;
  avgProductPrice: number;
  movieGenreDistribution: Record<string, number>;
  productCategoryDistribution: Record<string, number>;
  ratingHistogram: Record<string, number>;
  userInsights: UserInsights;
  algorithmBenchmarks: AlgorithmBenchmark[];
}
