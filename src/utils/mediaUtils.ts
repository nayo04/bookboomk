import { MediaBookmark, Platform } from '../types';

/**
 * Splits seconds into { hours, minutes, seconds }
 */
export function secondsToHMS(totalSeconds: number | null | undefined) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const secs = Math.floor(totalSeconds);
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  return { hours, minutes, seconds };
}

/**
 * Converts hours, minutes, seconds into total seconds
 */
export function hmsToSeconds(hours: number, minutes: number, seconds: number): number {
  const h = Math.max(0, isNaN(hours) ? 0 : hours);
  const m = Math.max(0, isNaN(minutes) ? 0 : minutes);
  const s = Math.max(0, isNaN(seconds) ? 0 : seconds);
  return h * 3600 + m * 60 + s;
}

/**
 * Formats seconds into "hh:mm:ss" string (e.g. "00:01:23" or "01:15:30")
 */
export function formatSecondsToHHMMSS(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '00:00:00';
  }

  const { hours, minutes, seconds: secs } = secondsToHMS(seconds);
  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

/**
 * Backwards compatible helper or short time string
 */
export function formatSecondsToTime(seconds: number | null | undefined): string {
  return formatSecondsToHHMMSS(seconds);
}

export function parseTimeToSeconds(input: string | number): number {
  if (typeof input === 'number') return Math.max(0, Math.floor(input));
  if (!input) return 0;

  const str = input.trim();

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  let totalSec = 0;
  const hMatch = str.match(/(\d+)\s*(h|시간)/i);
  const mMatch = str.match(/(\d+)\s*(m|분)/i);
  const sMatch = str.match(/(\d+)\s*(s|초)/i);

  if (hMatch || mMatch || sMatch) {
    if (hMatch) totalSec += parseInt(hMatch[1], 10) * 3600;
    if (mMatch) totalSec += parseInt(mMatch[1], 10) * 60;
    if (sMatch) totalSec += parseInt(sMatch[1], 10);
    return totalSec;
  }

  const parts = str.split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return 0;
}

/**
 * Parses URL to determine platform and extract ID / metadata / timestamp
 */
export interface ParsedMedia {
  platform: Platform;
  embedId: string;
  startTime?: number;
  thumbnailUrl?: string;
  isValid: boolean;
  error?: string;
}

export function parseMediaUrl(url: string): ParsedMedia {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { platform: 'youtube', embedId: '', isValid: false, error: 'URL을 입력해주세요.' };
  }

  // 1. YouTube check (includes watch, live, shorts, embed, youtu.be)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = cleanUrl.match(ytRegex);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    let startTime = 0;

    try {
      const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      const tParam = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
      if (tParam) {
        startTime = parseTimeToSeconds(tParam);
      }
    } catch {
      const tMatch = cleanUrl.match(/[?&](?:t|start)=([0-9a-z]+)/i);
      if (tMatch) {
        startTime = parseTimeToSeconds(tMatch[1]);
      }
    }

    return {
      platform: 'youtube',
      embedId: videoId,
      startTime,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
    };
  }

  // 2. Twitter / X check
  const twRegex = /(?:twitter\.com|x\.com)\/(?:[a-zA-Z0-9_]+)\/status\/([0-9]+)/;
  const twMatch = cleanUrl.match(twRegex);

  if (twMatch && twMatch[1]) {
    const tweetId = twMatch[1];

    // Extract handle if available
    const handleMatch = cleanUrl.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status/);
    const handle = handleMatch ? `@${handleMatch[1]}` : '@twitter';

    return {
      platform: 'twitter',
      embedId: tweetId,
      thumbnailUrl: `https://unavatar.io/x/${handle.replace('@', '')}`,
      isValid: true,
    };
  }

  return {
    platform: 'youtube',
    embedId: '',
    isValid: false,
    error: '지원되지 않는 URL 형식입니다. 올바른 유튜브 또는 트위터(X) 링크를 입력해주세요.',
  };
}

/**
 * Initial sample bookmarks for instant display
 */
export const DEFAULT_BOOKMARKS: MediaBookmark[] = [
  {
    id: 'bm-sample-1',
    platform: 'youtube',
    url: 'https://www.youtube.com/live/_2vEEfh2D2c?si=4Wt8OOeEmv5yw7lx',
    embedId: '_2vEEfh2D2c',
    title: '유튜브 라이브 스트리밍 주요 클립 구간',
    comment: '00:01:30부터 시작되는 라이브 방송 핵심 하이라이트 메시지입니다.',
    category: '뉴스/정보',
    tags: ['라이브', '뉴스', '하이라이트'],
    startTime: 90,
    endTime: 300,
    createdAt: Date.now() - 3600000 * 2,
    isFavorite: true,
    hasVideo: true,
    thumbnailUrl: 'https://img.youtube.com/vi/_2vEEfh2D2c/hqdefault.jpg',
  },
  {
    id: 'bm-sample-2',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    embedId: 'jfKfPfyJRdk',
    title: '집중력을 높여주는 로파이 비트 (학습용)',
    comment: '집중 코딩 및 작업 타임에 듣기 좋은 잔잔한 칠 비트 구간입니다.',
    category: '공부/학습',
    tags: ['Lofi', '집중', '코딩'],
    startTime: 300,
    endTime: 600,
    createdAt: Date.now() - 3600000 * 5,
    isFavorite: false,
    hasVideo: true,
    author: 'Lofi Girl',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  },
  {
    id: 'bm-sample-3',
    platform: 'twitter',
    url: 'https://x.com/NASA/status/1815000000000000000',
    embedId: '1815000000000000000',
    title: 'NASA 우주 탐사 미션 동영상 소식',
    comment: '00:00:15초부터 영상 하이라이트가 시작되는 트위터 미디어 비디오 스레드입니다.',
    category: '뉴스/정보',
    tags: ['우주', 'NASA', '과학'],
    startTime: 15,
    endTime: 45,
    createdAt: Date.now() - 3600000 * 12,
    isFavorite: true,
    hasVideo: true,
    author: '@NASA',
    thumbnailUrl: 'https://unavatar.io/x/NASA',
  },
  {
    id: 'bm-sample-4',
    platform: 'twitter',
    url: 'https://x.com/OpenAI/status/1800000000000000000',
    embedId: '1800000000000000000',
    title: '인공지능 연구 발표 텍스트 글 스레드',
    comment: '영상 없이 글만 수록된 트위터 아티클 게시글입니다. 게시자 프로필 사진이 썸네일로 표시됩니다.',
    category: '개발/IT',
    tags: ['AI', 'OpenAI', 'IT'],
    startTime: 0,
    endTime: null,
    createdAt: Date.now() - 3600000 * 24,
    isFavorite: false,
    hasVideo: false,
    author: '@OpenAI',
    authorAvatarUrl: 'https://unavatar.io/x/OpenAI',
  }
];

export const PRESET_CATEGORIES = [
  '전체',
  '공부/학습',
  '음악/공연',
  '운동/피트니스',
  '게임/엔터',
  '뉴스/정보',
  '개발/IT',
  '기타',
];

