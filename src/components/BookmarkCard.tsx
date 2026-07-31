import React from 'react';
import { Reorder } from 'motion/react';
import { MediaBookmark } from '../types';
import { formatSecondsToHHMMSS } from '../utils/mediaUtils';
import {
  GripVertical,
  Play,
  Star,
  Trash2,
  Edit2,
  Clock,
  Folder,
  Tv,
  Twitter,
  MessageSquare,
  Video,
  ExternalLink
} from 'lucide-react';

interface BookmarkCardProps {
  bookmark: MediaBookmark;
  onPlay: (bookmark: MediaBookmark) => void;
  onEdit: (bookmark: MediaBookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectTag?: (tag: string) => void;
  isDragEnabled: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isSelectionMode?: boolean;
  layoutMode?: 'grid' | 'list';
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectCategory,
  onSelectTag,
  isDragEnabled,
  isSelected = false,
  onToggleSelect,
  layoutMode = 'grid',
}) => {
  const isYouTube = bookmark.platform === 'youtube';
  const showTime = isYouTube || bookmark.hasVideo;

  if (layoutMode === 'grid') {
    return (
      <Reorder.Item
        value={bookmark}
        id={bookmark.id}
        dragListener={isDragEnabled}
        className={`group bg-white dark:bg-slate-900 rounded-2xl border ${
          isSelected
            ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200/80 dark:border-slate-800'
        } shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between relative h-full`}
      >
        {/* Top Header Controls: Checkbox, Drag Handle, Platform Badge & Favorite */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(bookmark.id)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
            )}
            <div
              className={`p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded ${
                !isDragEnabled ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="드래그하여 순서 변경"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {isYouTube ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-md text-[11px] font-bold">
                <Tv className="w-3 h-3" />
                YouTube
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-md text-[11px] font-bold">
                <Twitter className="w-3 h-3" />
                Twitter
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(bookmark.id)}
            className={`p-1 rounded-lg transition ${
              bookmark.isFavorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
            }`}
            title="즐겨찾기"
          >
            <Star className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Thumbnail Preview Area */}
        <div
          onClick={() => onPlay(bookmark)}
          className="relative w-full aspect-video bg-slate-950 overflow-hidden cursor-pointer group/thumb border-b border-slate-100 dark:border-slate-800"
        >
          {isYouTube ? (
            <img
              src={
                bookmark.thumbnailUrl ||
                `https://img.youtube.com/vi/${bookmark.embedId}/hqdefault.jpg`
              }
              alt={bookmark.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-90 group-hover/thumb:opacity-100"
            />
          ) : bookmark.hasVideo ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-900 to-slate-950 text-sky-400 p-3 text-center">
              <Video className="w-8 h-8 mb-1 text-sky-300" />
              <span className="text-xs font-bold tracking-tight text-sky-200">
                트위터 미디어 비디오
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-3 text-center">
              {bookmark.authorAvatarUrl || bookmark.thumbnailUrl ? (
                <img
                  src={bookmark.authorAvatarUrl || bookmark.thumbnailUrl}
                  alt="작성자 프로필"
                  className="w-12 h-12 rounded-full object-cover mb-1 border border-slate-700"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Twitter className="w-8 h-8 text-sky-400 mb-1" />
              )}
              <span className="text-xs font-bold text-slate-400">
                트위터 텍스트 게시물
              </span>
            </div>
          )}

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 flex items-center justify-center transition">
            <div className="w-10 h-10 bg-indigo-600/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Timestamp Badge */}
          {showTime && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[11px] font-mono rounded font-bold backdrop-blur-xs">
              {formatSecondsToHHMMSS(bookmark.startTime)}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Category & Timestamp Pill Row */}
            <div className="flex items-center justify-between gap-1 text-xs">
              <button
                onClick={() => onSelectCategory(bookmark.category)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-medium transition truncate"
              >
                <Folder className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">{bookmark.category}</span>
              </button>

              {showTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-md text-[11px] font-mono font-semibold shrink-0">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  {formatSecondsToHHMMSS(bookmark.startTime)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              onClick={() => onPlay(bookmark)}
              className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-2 leading-snug"
            >
              {bookmark.title}
            </h3>

            {/* Comment Note */}
            {bookmark.comment && (
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60 leading-relaxed">
                <MessageSquare className="w-3 h-3 text-indigo-500 inline mr-1 -mt-0.5" />
                {bookmark.comment}
              </p>
            )}

            {/* Tag Chips */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {bookmark.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onSelectTag?.(tag)}
                    className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded text-[10px] font-medium transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(bookmark.createdAt).toLocaleDateString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
              })}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPlay(bookmark)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                재생
              </button>
              {isYouTube ? (
                <a
                  href={`https://www.youtube.com/watch?v=${bookmark.embedId}&t=${bookmark.startTime || 0}s&autoplay=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                  title="유튜브 새 창에서 시작 시간부터 자동 재생"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition"
                  title="트위터(X)에서 직접 보기"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => onEdit(bookmark)}
                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                title="수정"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(bookmark.id)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition"
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Reorder.Item>
    );
  }

  // Compact List Mode (horizontal constrained)
  return (
    <Reorder.Item
      value={bookmark}
      id={bookmark.id}
      dragListener={isDragEnabled}
      className={`group bg-white dark:bg-slate-900 rounded-2xl border ${
        isSelected
          ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 dark:border-slate-800'
      } shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-stretch gap-0 relative`}
    >
      {/* Checkbox, Drag & Thumbnail */}
      <div className="flex items-center justify-between sm:justify-start px-3 py-2 sm:py-0 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 shrink-0 gap-2">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(bookmark.id)}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
          />
        )}

        <div
          className={`p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded ${
            !isDragEnabled ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          title="드래그하여 순서 변경"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div
          onClick={() => onPlay(bookmark)}
          className="relative w-28 h-18 sm:w-32 sm:h-20 bg-slate-900 rounded-xl overflow-hidden cursor-pointer group/thumb my-2 shrink-0 border border-slate-200 dark:border-slate-800"
        >
          {isYouTube ? (
            <img
              src={
                bookmark.thumbnailUrl ||
                `https://img.youtube.com/vi/${bookmark.embedId}/hqdefault.jpg`
              }
              alt={bookmark.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-90 group-hover/thumb:opacity-100"
            />
          ) : bookmark.hasVideo ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-900 to-slate-900 text-sky-400 p-2 text-center">
              <Video className="w-5 h-5 mb-0.5 text-sky-300" />
              <span className="text-[10px] font-bold text-sky-200">비디오</span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300 p-2 text-center">
              <Twitter className="w-5 h-5 text-sky-400 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-400">트위터</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 flex items-center justify-center transition">
            <div className="w-8 h-8 bg-indigo-600/90 text-white rounded-full flex items-center justify-center shadow-md">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
          </div>

          {showTime && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded font-semibold">
              {formatSecondsToHHMMSS(bookmark.startTime)}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0 space-y-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {isYouTube ? (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded text-[11px] font-bold">
                  YouTube
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded text-[11px] font-bold">
                  Twitter
                </span>
              )}

              <button
                onClick={() => onSelectCategory(bookmark.category)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium"
              >
                <Folder className="w-3 h-3 text-indigo-500" />
                {bookmark.category}
              </button>

              {showTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded text-[11px] font-mono font-semibold">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  {formatSecondsToHHMMSS(bookmark.startTime)}
                </span>
              )}
            </div>

            <button
              onClick={() => onToggleFavorite(bookmark.id)}
              className={`p-1 rounded transition ${
                bookmark.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
              }`}
            >
              <Star className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h3
            onClick={() => onPlay(bookmark)}
            className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-indigo-600 cursor-pointer transition line-clamp-1"
          >
            {bookmark.title}
          </h3>

          {bookmark.comment && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded text-[11px]">
              {bookmark.comment}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(bookmark.createdAt).toLocaleDateString('ko-KR')}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPlay(bookmark)}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[11px] transition"
            >
              재생
            </button>
            {isYouTube ? (
              <a
                href={`https://www.youtube.com/watch?v=${bookmark.embedId}&t=${bookmark.startTime || 0}s&autoplay=1`}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition"
                title="유튜브 새 창에서 시작 시간부터 자동 재생"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded transition"
                title="트위터(X)에서 직접 보기"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => onEdit(bookmark)}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1 text-slate-400 hover:text-red-600 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};
