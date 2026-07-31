import React, { useRef, useState } from 'react';
import { MediaBookmark } from '../types';
import { exportBookmarksAsJSON } from '../utils/storage';
import { loginWithGoogle, logoutFirebase, User } from '../lib/firebase';
import {
  Clock,
  Plus,
  Tv,
  Twitter,
  Download,
  Upload,
  Bookmark,
  CloudCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  Loader2
} from 'lucide-react';

interface NavbarProps {
  bookmarks: MediaBookmark[];
  onOpenAddModal: () => void;
  onImportBookmarks: (imported: MediaBookmark[]) => void;
  user: User | null;
  isFirebaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarks,
  onOpenAddModal,
  onImportBookmarks,
  user,
  isFirebaseConnected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const youtubeCount = bookmarks.filter((b) => b.platform === 'youtube').length;
  const twitterCount = bookmarks.filter((b) => b.platform === 'twitter').length;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      setImportNotice({
        type: 'success',
        text: 'Google 계정으로 성공적으로 로그인되었습니다.',
      });
      setTimeout(() => setImportNotice(null), 4000);
    } catch (err: unknown) {
      console.error('Google login failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled')) {
        setImportNotice({
          type: 'error',
          text: 'Google 로그인 창이 닫혔습니다.',
        });
      } else {
        setImportNotice({
          type: 'error',
          text: 'Google 로그인 중 오류가 발생했습니다. 브라우저 팝업 차단을 확인해 주세요.',
        });
      }
      setTimeout(() => setImportNotice(null), 5000);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      setImportNotice({
        type: 'success',
        text: '로그아웃 되었습니다.',
      });
      setTimeout(() => setImportNotice(null), 3000);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportBookmarks(json);
          setImportNotice({
            type: 'success',
            text: `성공적으로 ${json.length}개의 북마크를 가져왔습니다.`,
          });
          setTimeout(() => setImportNotice(null), 4000);
        } else {
          setImportNotice({
            type: 'error',
            text: '올바른 JSON 배열 형식이 아닙니다.',
          });
          setTimeout(() => setImportNotice(null), 4000);
        }
      } catch {
        setImportNotice({
          type: 'error',
          text: '올바른 JSON 백업 파일이 아닙니다.',
        });
        setTimeout(() => setImportNotice(null), 4000);
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl sm:rounded-2xl shadow-md shadow-indigo-600/20">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base md:text-lg tracking-tight whitespace-nowrap">
                타임클립 <span className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-base">TimeClip</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10px] font-extrabold whitespace-nowrap">
                <CloudCheck className="w-3 h-3" />
                Firebase DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
              유튜브 구간 재생 & 트위터 클립 · 파이어베이스 클라우드 동기화
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Firebase User Auth Button */}
          {user && !user.isAnonymous ? (
            <div className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-indigo-300 dark:border-indigo-700 object-cover shrink-0"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-indigo-500 ml-0.5 shrink-0" />
              )}
              <span className="hidden sm:inline font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] sm:max-w-[120px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-1.5 py-1 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer text-[11px] font-bold"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 whitespace-nowrap"
              title="Google 계정으로 로그인하여 파이어베이스 실시간 클라우드 동기화"
            >
              {isLoggingIn ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              )}
              <span className="text-xs font-bold">{isLoggingIn ? '로그인...' : '로그인'}</span>
            </button>
          )}

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
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
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-1.5">
            <button
              onClick={() => exportBookmarksAsJSON(bookmarks)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
              title="북마크 JSON 데이터 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
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
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span className="whitespace-nowrap font-extrabold">새 북마크</span>
          </button>
        </div>
      </div>

      {importNotice && (
        <div
          className={`px-4 py-2 text-xs font-bold text-center border-t transition ${
            importNotice.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {importNotice.text}
        </div>
      )}
    </header>
  );
};


