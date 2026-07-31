export type Platform = 'youtube' | 'twitter';

export interface MediaBookmark {
  id: string;
  platform: Platform;
  url: string;
  embedId: string; // YouTube videoId or Tweet ID
  title: string;
  comment: string;
  category: string;
  tags?: string[]; // Tag list
  startTime: number; // In seconds
  endTime: number | null; // In seconds or null
  createdAt: number; // Timestamp
  isFavorite?: boolean;
  hasVideo?: boolean; // True for YouTube, toggleable for Twitter
  author?: string;
  authorAvatarUrl?: string; // Profile picture for text-only tweets
  thumbnailUrl?: string;
  isLooping?: boolean; // 구간 연속 반복 재생
}

export type SortMode = 'custom' | 'newest' | 'oldest' | 'title';

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedTag?: string;
  platform: 'all' | 'youtube' | 'twitter';
  favoritesOnly: boolean;
}

