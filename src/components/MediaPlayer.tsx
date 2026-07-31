import React, { useState } from 'react';
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
  Video
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

  if (!bookmark) return null;

  const isYouTube = bookmark.platform === 'youtube';
  const showTimeControls = isYouTube || bookmark.hasVideo;
  const activeStart = currentStartOffset !== null ? currentStartOffset : bookmark.startTime;

  const getYouTubeEmbedUrl = () => {
    let url = `https://www.youtube.com/embed/${bookmark.embedId}?autoplay=1&enablejsapi=1`;
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
          {isYouTube && (
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
      <div className="p-4 md:p-6 bg-slate-950">
        {isYouTube ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
            <iframe
              key={playerKey}
              src={getYouTubeEmbedUrl()}
              title={bookmark.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full bg-slate-900 rounded-xl p-2 md:p-4">
            <TwitterEmbed tweetId={bookmark.embedId} url={bookmark.url} title={bookmark.title} />
          </div>
        )}

        {/* Interactive Time Controls */}
        {showTimeControls && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white/90">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                구간: {formatSecondsToHHMMSS(activeStart)}{' '}
                {bookmark.endTime !== null && bookmark.endTime !== undefined
                  ? `~ ${formatSecondsToHHMMSS(bookmark.endTime)}`
                  : '(끝까지)'}
              </span>

              {isYouTube && (
                <button
                  onClick={handleRestartSegment}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
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
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  -10초
                </button>
                <button
                  onClick={() => handleJumpToTime(-5)}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  -5초
                </button>
                <button
                  onClick={() => handleJumpToTime(5)}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  +5초
                </button>
                <button
                  onClick={() => handleJumpToTime(10)}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  +10초
                </button>
                <button
                  onClick={handleCopyTimestampLink}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? '복사 완료' : '구간 링크 복사'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Twitter Embed Guidance Banner if timing set */}
        {!isYouTube && bookmark.hasVideo && (
          <div className="mt-3 p-3 bg-sky-950/80 border border-sky-800/80 rounded-xl text-xs text-sky-200 flex items-start gap-2.5">
            <Twitter className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sky-300 block">
                📌 트위터(X) 영상 구간 재생 안내
              </span>
              <p className="text-[11px] text-sky-200/90 leading-relaxed">
                트위터 임베드 위젯 정책상 영상 자동 시간 이동은 지원되지 않습니다. 설정하신 시작 시간 <strong className="text-amber-300 font-mono">[{formatSecondsToHHMMSS(activeStart)}]</strong>을 확인하신 후 트위터 플레이어 하단 타임바를 직접 이동해 보세요.
              </p>
            </div>
          </div>
        )}

        {/* YouTube Membership/Private video notice */}
        {isYouTube && (
          <div className="mt-3.5 p-4 bg-red-950/70 border border-red-800/80 rounded-xl text-xs text-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start gap-2.5">
              <Tv className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-200 block text-xs">
                  🔒 멤버십 전용 / 로그인 및 외부 재생 제한 동영상 안내
                </span>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  유튜브 정책상 <strong className="text-white">멤버십 전용 영상이나 연령/퍼가기 제한 영상</strong>은 외부 임베드 플레이어에서 직접 재생이 차단될 수 있습니다. 아래 버튼을 누르면 설정하신 시작 시간부터 유튜브 새 창에서 자동 재생됩니다.
                </p>
              </div>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${bookmark.embedId}&t=${activeStart}s&autoplay=1`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 shadow-lg shadow-red-900/40 self-end sm:self-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>시작 구간부터 새 창 재생 ({formatSecondsToHHMMSS(activeStart)}~)</span>
            </a>
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
