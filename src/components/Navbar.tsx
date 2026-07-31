import React, { useRef } from 'react';
import { MediaBookmark } from '../types';
import { exportBookmarksAsJSON } from '../utils/storage';
import {
  Clock,
  Plus,
  Tv,
  Twitter,
  Download,
  Upload,
  Bookmark,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  bookmarks: MediaBookmark[];
  onOpenAddModal: () => void;
  onImportBookmarks: (imported: MediaBookmark[]) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarks,
  onOpenAddModal,
  onImportBookmarks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const youtubeCount = bookmarks.filter((b) => b.platform === 'youtube').length;
  const twitterCount = bookmarks.filter((b) => b.platform === 'twitter').length;

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportBookmarks(json);
          alert(`성공적으로 ${json.length}개의 북마크를 가져왔습니다.`);
        }
      } catch {
        alert('올바른 JSON 백업 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-base md:text-lg tracking-tight">
                타임클립 <span className="text-indigo-600 dark:text-indigo-400">TimeClip</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-extrabold">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              유튜브 특정 구간 재생 & 트위터 북마크 라이브러리
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              전체 {bookmarks.length}개
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Tv className="w-3.5 h-3.5" />
              {youtubeCount}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <Twitter className="w-3.5 h-3.5" />
              {twitterCount}
            </span>
          </div>

          {/* Backup / Export / Import */}
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
            <button
              onClick={() => exportBookmarksAsJSON(bookmarks)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition flex items-center gap-1"
              title="북마크 JSON 데이터 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition flex items-center gap-1"
              title="북마크 JSON 데이터 가져오기"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Add Bookmark Primary Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>새 북마크 추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
