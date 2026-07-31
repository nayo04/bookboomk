import React from 'react';
import { Reorder, useDragControls } from 'motion/react';
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
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUpDown
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
  currentIndex?: number;
  totalCount?: number;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onMoveToTop?: (id: string) => void;
  onMoveToBottom?: (id: string) => void;
  onOpenJumpModal?: (bookmark: MediaBookmark) => void;
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
  currentIndex,
  totalCount,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onOpenJumpModal,
}) => {
  const isYouTube = bookmark.platform === 'youtube';
  const showTime = isYouTube || bookmark.hasVideo;
  const dragControls = useDragControls();

  const isFirst = currentIndex === 1;
  const isLast = currentIndex === totalCount;

  if (layoutMode === 'grid') {
    return (
      <Reorder.Item
        value={bookmark}
        id={bookmark.id}
        dragListener={false}
        dragControls={dragControls}
        layout
        whileDrag={{
          scale: 1.03,
          zIndex: 50,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`group bg-white dark:bg-slate-900 rounded-2xl border ${
          isSelected
            ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200/80 dark:border-slate-800'
        } shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between relative h-full`}
      >
        {/* Top Header Controls: Checkbox, Drag Handle, Quick Position Controls & Favorite */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 gap-1">
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(bookmark.id)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
            )}
            <div
              onPointerDown={(e) => {
                if (isDragEnabled) {
                  dragControls.start(e);
                }
              }}
              className={`p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded touch-none select-none shrink-0 ${
                isDragEnabled
                  ? 'cursor-grab active:cursor-grabbing text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title={isDragEnabled ? '핸들을 잡고 드래그하거나 버튼으로 이동' : '드래그 순서 변경 불가'}
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Quick Movement Controls when Custom Sort is Active */}
            {isDragEnabled && currentIndex !== undefined && totalCount !== undefined ? (
              <div className="flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/60 p-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <button
                  type="button"
                  onClick={() => onOpenJumpModal?.(bookmark)}
                  className="px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded transition flex items-center gap-0.5 cursor-pointer"
                  title="클릭하여 원하는 위치 번호로 직접 이동"
                >
                  <span className="font-mono">#{currentIndex}</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-indigo-500" />
                </button>

                <div className="w-[1px] h-3 bg-indigo-200 dark:bg-indigo-800 mx-0.5" />

                <button
                  type="button"
                  onClick={() => onMoveToTop?.(bookmark.id)}
                  disabled={isFirst}
                  className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 dark:hover:bg-indigo-800 disabled:opacity-30 disabled:hover:bg-transparent rounded transition cursor-pointer"
                  title="맨 위로 이동"
                >
                  <ArrowUpToLine className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => onMoveUp?.(bookmark.id)}
                  disabled={isFirst}
                  className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 dark:hover:bg-indigo-800 disabled:opacity-30 disabled:hover:bg-transparent rounded transition cursor-pointer"
                  title="한 칸 위로/왼쪽으로 이동"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => onMoveDown?.(bookmark.id)}
                  disabled={isLast}
                  className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 dark:hover:bg-indigo-800 disabled:opacity-30 disabled:hover:bg-transparent rounded transition cursor-pointer"
                  title="한 칸 아래로/오른쪽으로 이동"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => onMoveToBottom?.(bookmark.id)}
                  disabled={isLast}
                  className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 dark:hover:bg-indigo-800 disabled:opacity-30 disabled:hover:bg-transparent rounded transition cursor-pointer"
                  title="맨 아래로 이동"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                </button>
              </div>
            ) : (
              isYouTube ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded text-[10px] sm:text-[11px] font-bold">
                  <Tv className="w-3 h-3" />
                  YouTube
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded text-[10px] sm:text-[11px] font-bold">
                  <Twitter className="w-3 h-3" />
                  Twitter
                </span>
              )
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

        {/* Thumbnail Preview Area - Compact on mobile */}
        <div
          onClick={() => onPlay(bookmark)}
          className="relative w-full h-36 sm:h-auto sm:aspect-video bg-slate-950 overflow-hidden cursor-pointer group/thumb border-b border-slate-100 dark:border-slate-800"
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-900 to-slate-950 text-sky-400 p-2 text-center">
              <Video className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-sky-300" />
              <span className="text-[11px] sm:text-xs font-bold tracking-tight text-sky-200">
                트위터 미디어 비디오
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-2 text-center">
              {bookmark.authorAvatarUrl || bookmark.thumbnailUrl ? (
                <img
                  src={bookmark.authorAvatarUrl || bookmark.thumbnailUrl}
                  alt="작성자 프로필"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mb-1 border border-slate-700"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Twitter className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400 mb-1" />
              )}
              <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                트위터 텍스트 게시물
              </span>
            </div>
          )}

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 flex items-center justify-center transition">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Timestamp Badge */}
          {showTime && (
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-white text-[10px] sm:text-[11px] font-mono rounded font-bold backdrop-blur-xs">
              {formatSecondsToHHMMSS(bookmark.startTime)}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-2.5 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* Category & Timestamp Pill Row */}
            <div className="flex items-center justify-between gap-1 text-xs">
              <button
                onClick={() => onSelectCategory(bookmark.category)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] sm:text-[11px] font-medium transition truncate"
              >
                <Folder className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">{bookmark.category}</span>
              </button>

              {showTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-md text-[10px] sm:text-[11px] font-mono font-semibold shrink-0">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  {formatSecondsToHHMMSS(bookmark.startTime)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              onClick={() => onPlay(bookmark)}
              className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition line-clamp-2 leading-tight sm:leading-snug"
            >
              {bookmark.title}
            </h3>

            {/* Comment Note */}
            {bookmark.comment && (
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60 leading-relaxed">
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
                    className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded text-[10px] font-medium transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(bookmark.createdAt).toLocaleDateString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
              })}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPlay(bookmark)}
                className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition shadow-xs cursor-pointer"
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
                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                title="수정"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(bookmark.id)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition cursor-pointer"
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
      dragListener={false}
      dragControls={dragControls}
      layout
      whileDrag={{
        scale: 1.02,
        zIndex: 50,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group bg-white dark:bg-slate-900 rounded-2xl border ${
        isSelected
          ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 dark:border-slate-800'
      } shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-stretch gap-0 relative`}
    >
      {/* Checkbox, Drag & Thumbnail */}
      <div className="flex items-center justify-between sm:justify-start px-2.5 py-1.5 sm:py-0 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 shrink-0 gap-2">
        <div className="flex items-center gap-1.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(bookmark.id)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
            />
          )}

          <div
            onPointerDown={(e) => {
              if (isDragEnabled) {
                dragControls.start(e);
              }
            }}
            className={`p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded touch-none select-none ${
              isDragEnabled
                ? 'cursor-grab active:cursor-grabbing text-indigo-500'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title={isDragEnabled ? '드래그하여 순서 변경' : '드래그 순서 변경 불가'}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* List Mode Quick Movement Controls */}
          {isDragEnabled && currentIndex !== undefined && totalCount !== undefined && (
            <div className="flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/60 p-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
              <button
                type="button"
                onClick={() => onOpenJumpModal?.(bookmark)}
                className="px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded transition font-mono cursor-pointer"
                title="위치 이동"
              >
                #{currentIndex}
              </button>
              <button
                type="button"
                onClick={() => onMoveToTop?.(bookmark.id)}
                disabled={isFirst}
                className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 disabled:opacity-30 rounded transition cursor-pointer"
                title="맨 위로"
              >
                <ArrowUpToLine className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onMoveUp?.(bookmark.id)}
                disabled={isFirst}
                className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 disabled:opacity-30 rounded transition cursor-pointer"
                title="위로"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown?.(bookmark.id)}
                disabled={isLast}
                className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 disabled:opacity-30 rounded transition cursor-pointer"
                title="아래로"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onMoveToBottom?.(bookmark.id)}
                disabled={isLast}
                className="p-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200/60 disabled:opacity-30 rounded transition cursor-pointer"
                title="맨 아래로"
              >
                <ArrowDownToLine className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div
          onClick={() => onPlay(bookmark)}
          className="relative w-24 h-16 sm:w-32 sm:h-20 bg-slate-900 rounded-xl overflow-hidden cursor-pointer group/thumb my-1.5 shrink-0 border border-slate-200 dark:border-slate-800"
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
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600/90 text-white rounded-full flex items-center justify-center shadow-md">
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
      <div className="flex-1 p-2.5 sm:p-3.5 flex flex-col justify-between min-w-0 space-y-1.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {isYouTube ? (
                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded text-[10px] sm:text-[11px] font-bold">
                  YouTube
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded text-[10px] sm:text-[11px] font-bold">
                  Twitter
                </span>
              )}

              <button
                onClick={() => onSelectCategory(bookmark.category)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] sm:text-[11px] font-medium"
              >
                <Folder className="w-3 h-3 text-indigo-500" />
                {bookmark.category}
              </button>

              {showTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded text-[10px] sm:text-[11px] font-mono font-semibold">
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
            className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm hover:text-indigo-600 cursor-pointer transition line-clamp-1"
          >
            {bookmark.title}
          </h3>

          {bookmark.comment && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 bg-slate-50 dark:bg-slate-800/40 p-1 rounded">
              {bookmark.comment}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
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
