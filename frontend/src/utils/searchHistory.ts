import { api } from '../services/api';

const SEARCH_HISTORY_KEY = 'cinetech_recent_searches';
const MAX_SEARCH_HISTORY = 10;

export interface RecentSearchItem {
  query: string;
  timestamp: number;
  itemType?: 'MOVIE' | 'PRODUCT' | 'ALL';
}

export const searchHistoryUtil = {
  getRecentSearches(): RecentSearchItem[] {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  addSearch(query: string, itemType: 'MOVIE' | 'PRODUCT' | 'ALL' = 'ALL'): RecentSearchItem[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getRecentSearches();

    const existing = this.getRecentSearches().filter(
      item => item.query.toLowerCase() !== trimmed.toLowerCase()
    );

    const updated: RecentSearchItem[] = [
      { query: trimmed, timestamp: Date.now(), itemType },
      ...existing,
    ].slice(0, MAX_SEARCH_HISTORY);

    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore local storage quota issues
    }

    // Record to Java backend signal service asynchronously
    api.recordSearch(itemType, trimmed).catch(() => {});

    // Dispatch event so all open search inputs / dropdowns sync
    window.dispatchEvent(new CustomEvent('search-history-updated', { detail: updated }));

    return updated;
  },

  removeSearch(queryToRemove: string): RecentSearchItem[] {
    const existing = this.getRecentSearches().filter(
      item => item.query.toLowerCase() !== queryToRemove.toLowerCase()
    );
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(existing));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('search-history-updated', { detail: existing }));
    return existing;
  },

  clearAll(): void {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('search-history-updated', { detail: [] }));
  },
};
