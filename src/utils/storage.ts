import { MediaBookmark } from '../types';
import { DEFAULT_BOOKMARKS } from './mediaUtils';

const STORAGE_KEY = 'timeclip_bookmarks_v1';
const CUSTOM_CATEGORIES_KEY = 'timeclip_categories_v1';

export function loadBookmarks(): MediaBookmark[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      saveBookmarks(DEFAULT_BOOKMARKS);
      return DEFAULT_BOOKMARKS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Fix stale dummy sample tweet IDs if present
      let migrated = false;
      const updated = parsed.map((item: MediaBookmark) => {
        if (item.embedId === '1815000000000000000') {
          migrated = true;
          return {
            ...item,
            embedId: '1650532292375830528',
            url: 'https://x.com/NASA/status/1650532292375830528',
          };
        }
        if (item.embedId === '1800000000000000000') {
          migrated = true;
          return {
            ...item,
            embedId: '1725597968987152643',
            url: 'https://x.com/OpenAI/status/1725597968987152643',
          };
        }
        return item;
      });
      if (migrated) {
        saveBookmarks(updated);
      }
      return updated;
    }
    return DEFAULT_BOOKMARKS;
  } catch (err) {
    console.error('Failed to load bookmarks from storage', err);
    return DEFAULT_BOOKMARKS;
  }
}

export function saveBookmarks(bookmarks: MediaBookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Failed to save bookmarks to storage', err);
  }
}

const DEFAULT_CATEGORIES = [
  '공부/학습',
  '음악/공연',
  '운동/피트니스',
  '게임/엔터',
  '뉴스/정보',
  '개발/IT',
  '기타',
];

export function loadCustomCategories(): string[] {
  try {
    const data = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load custom categories', err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCustomCategories(categories: string[]): void {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save custom categories', err);
  }
}

export function exportBookmarksAsJSON(bookmarks: MediaBookmark[]): void {
  const jsonStr = JSON.stringify(bookmarks, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeclip_bookmarks_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
