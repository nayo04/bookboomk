import React, { useState, useEffect } from 'react';
import { MediaBookmark } from '../types';
import { formatSecondsToHHMMSS } from '../utils/mediaUtils';
import { TwitterEmbed } from './TwitterEmbed';
import {
  X,
  RotateCcw,
  Clock,
  Folder,
  Share2,
  Check,
  ExternalLink,
  Edit2,
  Tv,
  Twitter,
  Video,
  Repeat
} from 'lucide-react';

interface MediaPlayerProps {
  bookmark: MediaBookmark | null;
  onClose: () => void;
  onEdit: (bookmark: MediaBookmark) => void;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ bookmark, onClose, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [playerKey, setPlayerKey] = useState(0); // Used to reload iframe on jump
  const [currentStartOffset, setCurrentStartOffset] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(bookmark?.isLooping ?? false);

  useEffect(() => {
    if (bookmark) {
      setIsLooping(bookmark.isLooping ?? false);
      setCurrentStartOffset(null);
    }
  }, [bookmark?.id]);

  if (!bookmark) return null;

  const isYouTube = bookmark.platform === 'youtube';
  const showTimeControls = isYouTube || bookmark.hasVideo;
  const activeStart = currentStartOffset !== null ? currentStartOffset : bookmark.startTime;

  // Auto loop timer for custom start~end range
  useEffect(() => {
    if (!isLooping || !bookmark.endTime || bookmark.endTime <= activeStart) return;
    const durationSec = bookmark.endTime - activeStart;
    if (durationSec <= 0) return;

    const timer = setTimeout(() => {
      setPlayerKey((prev) => prev + 1);
    }, (durationSec + 0.6) * 1000);

    return () => clearTimeout(timer);
  }, [isLooping, activeStart, bookmark.endTime, playerKey, bookmark.id]);

  const getYouTubeEmbedUrl = () => {
    let url = `https://www.youtube.com/embed/${bookmark.embedId}?autoplay=1&enablejsapi=1`;
    if (isLooping) {
      url += `&loop=1&playlist=${bookmark.embedId}`;
    }
    if (activeStart > 0) {
      url += `&start=${activeStart}`;
    }
    if (bookmark.endTime && bookmark.endTime > activeStart) {
      url += `&end=${bookmark.endTime}`;
    }
    return url;
  };

  const handleJumpToTime = (offsetSec: number) => {
    const newStart = Math.max(0, activeStart + offsetSec);
    setCurrentStartOffset(newStart);
    setPlayerKey((prev) => prev + 1);
  };

  const handleRestartSegment = () => {
    setCurrentStartOffset(bookmark.startTime);
    setPlayerKey((prev) => prev + 1);
  };

  const handleCopyTimestampLink = () => {
    let shareUrl = bookmark.url;
    if (isYouTube) {
      shareUrl = `https://youtu.be/${bookmark.embedId}?t=${activeStart}`;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Player Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {isYouTube ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-md text-xs font-bold tracking-tight shrink-0">
              <Tv className="w-3.5 h-3.5" />
              YouTube
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-md text-xs font-bold tracking-tight shrink-0">
              <Twitter className="w-3.5 h-3.5" />
              Twitter {bookmark.hasVideo ? '(동영상)' : '(글)'}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm md:text-base truncate">
            {bookmark.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isYouTube ? (
            <a
              href={`https://www.youtube.com/watch?v=${bookmark.embedId}&t=${activeStart}s`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
              title="로그인된 본인 유튜브 계정으로 새 창에서 시청하기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>YouTube 새 창에서 시청</span>
            </a>
          ) : (
            <a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
              title="트위터(X) 공식 페이지에서 직접 시청"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>트위터(X) 새 창에서 보기</span>
            </a>
          )}
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition text-xs flex items-center gap-1 font-medium"
            title="구간 및 정보 편집"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">수정</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition"
            title="플레이어 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Embed Area */}
      <div className="p-4 md:p-5 bg-slate-950">
        {isYouTube ? (
          <div className="max-w-3xl mx-auto">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
              <iframe
                key={playerKey}
                src={getYouTubeEmbedUrl()}
                title={bookmark.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-slate-900/90 rounded-xl p-2 md:p-3 ring-1 ring-white/10">
            <TwitterEmbed tweetId={bookmark.embedId} url={bookmark.url} title={bookmark.title} />
          </div>
        )}

        {/* Interactive Time Controls */}
        {showTimeControls && (
          <div className="max-w-3xl mx-auto mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-white/90">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                구간: {formatSecondsToHHMMSS(activeStart)}{' '}
                {bookmark.endTime !== null && bookmark.endTime !== undefined
                  ? `~ ${formatSecondsToHHMMSS(bookmark.endTime)}`
                  : '(끝까지)'}
              </span>

              {isYouTube && (
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    isLooping
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700/80'
                  }`}
                  title="해당 시간대 구간 연속 반복 재생 토글"
                >
                  <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'text-emerald-400 animate-spin-slow' : 'text-slate-400'}`} />
                  <span>{isLooping ? '구간 반복 ON' : '구간 반복 OFF'}</span>
                </button>
              )}

              {isYouTube && (
                <button
                  onClick={handleRestartSegment}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="설정된 시작 구간부터 다시 재생"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  시작점부터
                </button>
              )}
            </div>

            {isYouTube && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleJumpToTime(-10)}
                  className="px-2 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  -10초
                </button>
                <button
                  onClick={() => handleJumpToTime(-5)}
                  className="px-2 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  -5초
                </button>
                <button
                  onClick={() => handleJumpToTime(5)}
                  className="px-2 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  +5초
                </button>
                <button
                  onClick={() => handleJumpToTime(10)}
                  className="px-2 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  +10초
                </button>
                <button
                  onClick={handleCopyTimestampLink}
                  className={`flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-sm ${
                    copied ? 'bg-emerald-600' : ''
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? '복사 완료' : '링크 복사'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Small subtle tip for external/restricted videos */}
        {isYouTube && (
          <div className="max-w-3xl mx-auto mt-2 text-center text-[11px] text-slate-400">
            💡 멤버십/연령제한 영상이 임베드에서 재생되지 않는 경우, 상단의 <strong className="text-slate-300 font-semibold">[YouTube 새 창에서 시청]</strong>을 누르면 지정한 시간부터 시청하실 수 있습니다.
          </div>
        )}
      </div>

      {/* Detail info & comment */}
      <div className="p-5 space-y-3 bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium">
            <Folder className="w-3.5 h-3.5 text-indigo-500" />
            {bookmark.category}
          </span>

          <a
            href={bookmark.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition"
          >
            원본 링크 <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {bookmark.comment && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1 text-xs text-indigo-600 dark:text-indigo-400">
              💬 작성한 코멘트 & 타임스탬프 메모
            </span>
            {bookmark.comment}
          </div>
        )}
      </div>
    </div>
  );
};
