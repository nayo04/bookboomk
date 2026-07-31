import React, { useState, useEffect, useRef } from 'react';
import { MediaBookmark, FilterState, SortMode } from './types';
import {
  loadBookmarks,
  saveBookmarks,
  loadCustomCategories,
  saveCustomCategories,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { BookmarkList } from './components/BookmarkList';
import { MediaPlayer } from './components/MediaPlayer';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { ConfirmModal } from './components/ConfirmModal';
import {
  Clock,
  Tv,
  Twitter,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Share2,
  BookmarkCheck
} from 'lucide-react';

export default function App() {
  const [bookmarks, setBookmarks] = useState<MediaBookmark[]>(() => loadBookmarks());
  const [activeBookmark, setActiveBookmark] = useState<MediaBookmark | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<MediaBookmark | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>(() => loadCustomCategories());

  // Confirm delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [batchDeleteIds, setBatchDeleteIds] = useState<string[] | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: '전체',
    selectedTag: '',
    platform: 'all',
    favoritesOnly: false,
  });

  const [sortMode, setSortMode] = useState<SortMode>('custom');

  // Sync bookmarks with localStorage whenever state changes
  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  // Sync custom categories with localStorage
  useEffect(() => {
    saveCustomCategories(customCategories);
  }, [customCategories]);

  // Handle play action
  const handlePlayBookmark = (bm: MediaBookmark) => {
    setActiveBookmark(bm);
    // Smooth scroll to player
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle reorder
  const handleReorderBookmarks = (newOrder: MediaBookmark[]) => {
    setBookmarks(newOrder);
  };

  // Handle Save (Add or Edit)
  const handleSaveBookmark = (
    bookmarkData: Omit<MediaBookmark, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (bookmarkData.id) {
      // Edit existing
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === bookmarkData.id
            ? { ...b, ...bookmarkData, updatedAt: Date.now() }
            : b
        )
      );
      // If currently playing, update active player bookmark as well
      if (activeBookmark?.id === bookmarkData.id) {
        setActiveBookmark((prev) => (prev ? { ...prev, ...bookmarkData } : null));
      }
    } else {
      // Create new
      const newBookmark: MediaBookmark = {
        ...bookmarkData,
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
        isFavorite: false,
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      // Auto play newly created bookmark!
      handlePlayBookmark(newBookmark);
    }
  };

  // Handle Delete
  const handleDeleteBookmark = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteSingle = () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    if (activeBookmark?.id === id) {
      setActiveBookmark(null);
    }
    setDeleteTargetId(null);
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  // Handle Custom Category addition
  const handleAddCustomCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (customCategories.includes(trimmed)) {
      return;
    }
    setCustomCategories((prev) => [...prev, trimmed]);
  };

  // Handle Category Rename
  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === trimmedNew) return;

    if (customCategories.includes(trimmedNew)) {
      return;
    }

    // Update category list
    setCustomCategories((prev) =>
      prev.map((cat) => (cat === oldName ? trimmedNew : cat))
    );

    // Update bookmarks category
    setBookmarks((prev) =>
      prev.map((b) => (b.category === oldName ? { ...b, category: trimmedNew } : b))
    );

    // Update filter if currently selected
    if (filters.selectedCategory === oldName) {
      setFilters((prev) => ({ ...prev, selectedCategory: trimmedNew }));
    }
  };

  // Handle Category Delete (removes category and moves any contained bookmarks to '전체')
  const handleDeleteCategory = (catName: string) => {
    if (catName === '전체') return;

    // Delete category from customCategories state
    setCustomCategories((prev) => prev.filter((cat) => cat !== catName));

    // Re-assign bookmarks belonging to this deleted category to '전체'
    setBookmarks((prev) =>
      prev.map((b) => (b.category === catName ? { ...b, category: '전체' } : b))
    );

    // Reset filter if selected
    if (filters.selectedCategory === catName) {
      setFilters((prev) => ({ ...prev, selectedCategory: '전체' }));
    }
  };

  // Handle Batch Category Change
  const handleBatchChangeCategory = (bookmarkIds: string[], newCategory: string) => {
    if (!bookmarkIds || bookmarkIds.length === 0) return;
    setBookmarks((prev) =>
      prev.map((b) => (bookmarkIds.includes(b.id) ? { ...b, category: newCategory } : b))
    );
  };

  // Handle Batch Delete
  const handleBatchDeleteBookmarks = (bookmarkIds: string[]) => {
    if (!bookmarkIds || bookmarkIds.length === 0) return;
    setBatchDeleteIds(bookmarkIds);
  };

  const confirmBatchDelete = () => {
    if (!batchDeleteIds || batchDeleteIds.length === 0) return;
    const ids = batchDeleteIds;
    setBookmarks((prev) => prev.filter((b) => !ids.includes(b.id)));
    if (activeBookmark && ids.includes(activeBookmark.id)) {
      setActiveBookmark(null);
    }
    setBatchDeleteIds(null);
  };

  // Handle Import JSON
  const handleImportBookmarks = (importedList: MediaBookmark[]) => {
    setBookmarks((prev) => {
      // Combine avoiding duplicate IDs
      const existingIds = new Set(prev.map((b) => b.id));
      const newItems = importedList.filter((b) => !existingIds.has(b.id));
      return [...newItems, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        bookmarks={bookmarks}
        onOpenAddModal={() => {
          setEditingBookmark(null);
          setIsAddModalOpen(true);
        }}
        onImportBookmarks={handleImportBookmarks}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Active Media Player Drawer / Container */}
        <div ref={playerRef}>
          {activeBookmark && (
            <div className="mb-6">
              <MediaPlayer
                bookmark={activeBookmark}
                onClose={() => setActiveBookmark(null)}
                onEdit={(bm) => {
                  setEditingBookmark(bm);
                  setIsAddModalOpen(true);
                }}
              />
            </div>
          )}
        </div>

        {/* Hero Quick Banner / Instruction Guide */}
        {!activeBookmark && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-indigo-800/40">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
              <Clock className="w-64 h-64 text-indigo-300" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                유튜브 & 트위터 미디어 통합 북마크
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                원하는 유튜브 특정 시간대와 트위터 스레드를 한번에 관리하세요!
              </h2>

              <p className="text-xs md:text-sm text-indigo-100/80 leading-relaxed">
                영상 URL과 시작~종료 시간, 메모 및 카테고리를 등록해 두면 클릭 한 번으로 바로 해당 타임스탬프부터 재생됩니다. 태그 검색과 드래그 앤 드롭 순서 변경을 지원합니다.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
                <button
                  onClick={() => {
                    setEditingBookmark(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  북마크 등록하기
                </button>
                <div className="text-[11px] text-indigo-200/80 flex items-center gap-3 ml-2">
                  <span className="flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5 text-red-400" /> 유튜브 구간 재생
                  </span>
                  <span className="flex items-center gap-1">
                    <Twitter className="w-3.5 h-3.5 text-sky-400" /> 트위터 링크 카드
                  </span>
                  <span className="flex items-center gap-1">
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> 드래그 정렬
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Bookmarks List Section */}
        <BookmarkList
          bookmarks={bookmarks}
          onReorder={handleReorderBookmarks}
          filters={filters}
          onFilterChange={setFilters}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          onPlay={handlePlayBookmark}
          onEdit={(bm) => {
            setEditingBookmark(bm);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteBookmark}
          onToggleFavorite={handleToggleFavorite}
          onOpenAddModal={() => {
            setEditingBookmark(null);
            setIsAddModalOpen(true);
          }}
          customCategories={customCategories}
          onAddCustomCategory={handleAddCustomCategory}
          onRenameCategory={handleRenameCategory}
          onDeleteCategory={handleDeleteCategory}
          onBatchChangeCategory={handleBatchChangeCategory}
          onBatchDelete={handleBatchDeleteBookmarks}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 타임클립 (TimeClip) - 스마트 미디어 타임스탬프 북마크</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>유튜브 & 트위터 지원</span>
            <span>·</span>
            <span>로컬 스토리지 자동 저장</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        editingBookmark={editingBookmark}
        customCategories={customCategories}
        onAddCustomCategory={handleAddCustomCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Delete Single Bookmark Confirm Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="북마크 삭제"
        message="선택한 미디어 북마크를 정말 삭제하시겠습니까?"
        confirmText="삭제하기"
        cancelText="취소"
        type="danger"
        onConfirm={confirmDeleteSingle}
        onClose={() => setDeleteTargetId(null)}
      />

      {/* Delete Batch Bookmarks Confirm Modal */}
      <ConfirmModal
        isOpen={batchDeleteIds !== null}
        title="선택 항목 일괄 삭제"
        message={`선택한 ${batchDeleteIds?.length || 0}개의 북마크를 정말 삭제하시겠습니까?`}
        confirmText="일괄 삭제"
        cancelText="취소"
        type="danger"
        onConfirm={confirmBatchDelete}
        onClose={() => setBatchDeleteIds(null)}
      />
    </div>
  );
}
