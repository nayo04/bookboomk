import React, { useState } from 'react';
import { Reorder } from 'motion/react';
import { MediaBookmark, FilterState, SortMode } from '../types';
import { BookmarkCard } from './BookmarkCard';
import {
  Search,
  Star,
  Folder,
  ArrowUpDown,
  Plus,
  Sparkles,
  Tv,
  Twitter,
  X,
  GripVertical,
  Edit2,
  Trash2,
  Settings2,
  Tag,
  CheckSquare,
  Square,
  Layers,
  CheckCircle2,
  LayoutGrid,
  List,
  AlertTriangle
} from 'lucide-react';

interface BookmarkListProps {
  bookmarks: MediaBookmark[];
  onReorder: (newBookmarks: MediaBookmark[]) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  onPlay: (bookmark: MediaBookmark) => void;
  onEdit: (bookmark: MediaBookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddModal: () => void;
  customCategories: string[];
  onAddCustomCategory?: (cat: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (catName: string) => void;
  onBatchChangeCategory?: (bookmarkIds: string[], targetCategory: string) => void;
  onBatchDelete?: (bookmarkIds: string[]) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onReorder,
  filters,
  onFilterChange,
  sortMode,
  onSortModeChange,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenAddModal,
  customCategories,
  onAddCustomCategory,
  onRenameCategory,
  onDeleteCategory,
  onBatchChangeCategory,
  onBatchDelete,
}) => {
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryInput, setEditCategoryInput] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [catNotice, setCatNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<{ name: string; count: number } | null>(null);

  // Layout mode: 'grid' (compact card layout) vs 'list' (streamlined horizontal layout)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Batch Selection State
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [batchTargetCategory, setBatchTargetCategory] = useState<string>('');
  const [tagSearchInput, setTagSearchInput] = useState<string>('');

  // Combine categories directly from customCategories state
  const allCategories = Array.from(new Set(['전체', ...customCategories]));

  // Manageable categories (exclude '전체')
  const manageableCategories = customCategories.filter((c) => c !== '전체');

  // Unique list of all tags across all bookmarks for tag cloud/filter
  const allUniqueTags: string[] = Array.from(
    new Set(bookmarks.flatMap((b) => (b.tags || []) as string[]))
  );

  const filteredUniqueTags = tagSearchInput.trim()
    ? allUniqueTags.filter((t: string) => t.toLowerCase().includes(tagSearchInput.toLowerCase().trim()))
    : allUniqueTags;

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((b) => {
    // 1. Search Query (Title, Comment, OR Tags)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchComment = b.comment.toLowerCase().includes(q);
      const matchTags = b.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchComment && !matchTags) {
        return false;
      }
    }

    // 2. Selected Tag Filter
    if (filters.selectedTag) {
      if (!b.tags || !b.tags.includes(filters.selectedTag)) {
        return false;
      }
    }

    // 3. Category Filter
    if (filters.selectedCategory && filters.selectedCategory !== '전체') {
      if (b.category !== filters.selectedCategory) return false;
    }

    // 4. Platform Filter
    if (filters.platform !== 'all') {
      if (b.platform !== filters.platform) return false;
    }

    // 5. Favorites Only
    if (filters.favoritesOnly && !b.isFavorite) {
      return false;
    }

    return true;
  });

  // Sort logic when custom drag is not active
  let displayBookmarks = [...filteredBookmarks];
  if (sortMode === 'newest') {
    displayBookmarks.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortMode === 'oldest') {
    displayBookmarks.sort((a, b) => a.createdAt - b.createdAt);
  } else if (sortMode === 'title') {
    displayBookmarks.sort((a, b) => a.title.localeCompare(b.title));
  }

  const isDragEnabled =
    sortMode === 'custom' && !filters.searchQuery && filters.selectedCategory === '전체';

  const handleStartEditCat = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryInput(cat);
  };

  const handleSaveEditCat = (oldCat: string) => {
    const newCat = editCategoryInput.trim();
    if (newCat && newCat !== oldCat) {
      if (customCategories.includes(newCat)) {
        setCatNotice({
          type: 'error',
          text: `이미 '${newCat}' 카테고리가 존재합니다.`,
        });
        return;
      }
      onRenameCategory(oldCat, newCat);
      setCatNotice({
        type: 'success',
        text: `'${oldCat}' 카테고리가 '${newCat}'(으)로 변경되었습니다.`,
      });
    }
    setEditingCategory(null);
  };

  const handleDeleteCategoryClick = (cat: string) => {
    const bmCount = bookmarks.filter((b) => b.category === cat).length;
    setConfirmDeleteCat({ name: cat, count: bmCount });
  };

  const handleConfirmDeleteCategory = () => {
    if (!confirmDeleteCat) return;
    const { name, count } = confirmDeleteCat;
    onDeleteCategory(name);
    setCatNotice({
      type: 'success',
      text: `'${name}' 카테고리가 삭제되었습니다.${count > 0 ? ` (${count}개 북마크는 '전체' 카테고리로 이동됨)` : ''}`,
    });
    setConfirmDeleteCat(null);
  };

  // Toggle selection for a single bookmark card
  const handleToggleSelectBookmark = (id: string) => {
    setSelectedBookmarkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all currently displayed
  const handleToggleSelectAll = () => {
    if (selectedBookmarkIds.length === displayBookmarks.length && displayBookmarks.length > 0) {
      setSelectedBookmarkIds([]);
    } else {
      setSelectedBookmarkIds(displayBookmarks.map((b) => b.id));
    }
  };

  // Batch Category change submission
  const handleApplyBatchCategory = () => {
    if (!batchTargetCategory) {
      alert('이동할 카테고리를 선택해 주세요.');
      return;
    }
    if (selectedBookmarkIds.length === 0) return;

    if (onBatchChangeCategory) {
      onBatchChangeCategory(selectedBookmarkIds, batchTargetCategory);
      alert(`선택한 ${selectedBookmarkIds.length}개 북마크의 카테고리가 '${batchTargetCategory}'(으)로 일괄 변경되었습니다.`);
      setSelectedBookmarkIds([]);
      setBatchTargetCategory('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Header with Manage Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
          {allCategories.map((cat) => {
            const isSelected = filters.selectedCategory === cat;
            const count =
              cat === '전체'
                ? bookmarks.length
                : bookmarks.filter((b) => b.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => onFilterChange({ ...filters, selectedCategory: cat })}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Settings Trigger */}
        <button
          onClick={() => setIsCategoryManageOpen(!isCategoryManageOpen)}
          className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition shrink-0 border border-slate-200/80 dark:border-slate-700"
          title="카테고리 수정 및 삭제"
        >
          <Settings2 className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">카테고리 관리</span>
        </button>
      </div>

      {/* Category Management Drawer */}
      {isCategoryManageOpen && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl space-y-3 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-indigo-500" />
              카테고리 수정, 삭제 및 추가
            </span>
            <button
              onClick={() => setIsCategoryManageOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notice Banner */}
          {catNotice && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition ${
                catNotice.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <span>{catNotice.text}</span>
              <button
                onClick={() => setCatNotice(null)}
                className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Add Category Row */}
          <div className="flex gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmed = newCatInput.trim();
                  if (trimmed) {
                    if (customCategories.includes(trimmed)) {
                      setCatNotice({
                        type: 'error',
                        text: `이미 '${trimmed}' 카테고리가 존재합니다.`,
                      });
                      return;
                    }
                    onAddCustomCategory?.(trimmed);
                    setNewCatInput('');
                    setCatNotice({
                      type: 'success',
                      text: `'${trimmed}' 카테고리가 추가되었습니다.`,
                    });
                  }
                }
              }}
              placeholder="새 카테고리 이름 입력..."
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
            <button
              onClick={() => {
                const trimmed = newCatInput.trim();
                if (trimmed) {
                  if (customCategories.includes(trimmed)) {
                    setCatNotice({
                      type: 'error',
                      text: `이미 '${trimmed}' 카테고리가 존재합니다.`,
                    });
                    return;
                  }
                  onAddCustomCategory?.(trimmed);
                  setNewCatInput('');
                  setCatNotice({
                    type: 'success',
                    text: `'${trimmed}' 카테고리가 추가되었습니다.`,
                  });
                }
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              카테고리 추가
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {manageableCategories.map((cat) => {
              const bmCount = bookmarks.filter((b) => b.category === cat).length;

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {editingCategory === cat ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={editCategoryInput}
                        onChange={(e) => setEditCategoryInput(e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 border rounded text-xs text-slate-900 dark:text-slate-100"
                      />
                      <button
                        onClick={() => handleSaveEditCat(cat)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold text-[11px]"
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {cat}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 font-bold ${
                            bmCount > 0
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {bmCount}개
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditCat(cat)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                          title="카테고리 이름 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategoryClick(cat)}
                          className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition font-bold"
                          title={`'${cat}' 카테고리 삭제`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  카테고리 삭제 확인
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  카테고리 삭제 전 확인 경고
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 leading-relaxed space-y-2">
              <p className="font-semibold">
                정말 <span className="text-indigo-600 dark:text-indigo-400 font-bold">'{confirmDeleteCat.name}'</span> 카테고리를 삭제하시겠습니까?
              </p>
              {confirmDeleteCat.count > 0 ? (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ <strong>경고:</strong> 해당 카테고리에 포함된 <span className="font-bold underline">{confirmDeleteCat.count}개</span>의 북마크는 <strong>'전체'</strong> 카테고리로 자동 이동됩니다.
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  등록된 북마크가 없는 카테고리입니다. 삭제 시 해당 카테고리 항목이 삭제됩니다.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteCat(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Toolbar: Search, Tag Cloud, Platform Filter, Favorites, Layout & Sorting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Selected Tag Active Pill */}
        {filters.selectedTag && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>선택된 태그 필터: #{filters.selectedTag}</span>
            <button
              onClick={() => onFilterChange({ ...filters, selectedTag: undefined })}
              className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition ml-auto"
              title="태그 필터 해제"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input (Title, Comment & Tags) */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="제목, 코멘트, 태그(#) 검색..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Layout Toggle, Platform Filter, Favorites & Sorting */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-between md:justify-start shrink-0">
            {/* View Layout Mode Switcher (Grid vs List) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium shrink-0">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                title="카드 그리드 뷰 (2~3열 보기)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">그리드</span>
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                  layoutMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                title="컴팩트 리스트 뷰 (1열 보기)"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">리스트</span>
              </button>
            </div>

            {/* Platform Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium shrink-0">
              <button
                onClick={() => onFilterChange({ ...filters, platform: 'all' })}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  filters.platform === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, platform: 'youtube' })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                  filters.platform === 'youtube'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                YouTube
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, platform: 'twitter' })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                  filters.platform === 'twitter'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Twitter className="w-3.5 h-3.5" />
                Twitter
              </button>
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() =>
                onFilterChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
              }
              className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition border shrink-0 ${
                filters.favoritesOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filters.favoritesOnly ? 'fill-current' : ''}`} />
              <span>즐겨찾기</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortMode}
                onChange={(e) => onSortModeChange(e.target.value as SortMode)}
                className="px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
              >
                <option value="custom">✋ 순서 변경 (드래그)</option>
                <option value="newest">🕒 최신 등록순</option>
                <option value="oldest">⌛ 오래된순</option>
                <option value="title">🔤 제목 순</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tag Cloud & Quick Filter Section */}
        {allUniqueTags.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                등록된 태그 탐색 ({allUniqueTags.length}개)
              </span>
              {allUniqueTags.length > 5 && (
                <input
                  type="text"
                  value={tagSearchInput}
                  onChange={(e) => setTagSearchInput(e.target.value)}
                  placeholder="태그 검색..."
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] focus:outline-none"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {filteredUniqueTags.map((tag) => {
                const isSelected = filters.selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        selectedTag: isSelected ? undefined : tag,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
              {filteredUniqueTags.length === 0 && (
                <span className="text-[11px] text-slate-400 italic">검색 결과에 맞는 태그가 없습니다.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Batch Selection Action Bar */}
      {displayBookmarks.length > 0 && (
        <div className="bg-indigo-950 text-white rounded-2xl p-3.5 shadow-lg border border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 rounded-xl transition border border-indigo-700/60"
            >
              {selectedBookmarkIds.length === displayBookmarks.length && displayBookmarks.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-indigo-400" />
              )}
              <span>
                {selectedBookmarkIds.length === displayBookmarks.length && displayBookmarks.length > 0
                  ? '전체 해제'
                  : '전체 선택'}
              </span>
            </button>

            <span className="text-xs font-extrabold text-indigo-200 flex items-center gap-1">
              <Layers className="w-4 h-4 text-indigo-400" />
              {selectedBookmarkIds.length}개 항목 선택됨
            </span>
          </div>

          {selectedBookmarkIds.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <div className="flex items-center gap-1.5">
                <select
                  value={batchTargetCategory}
                  onChange={(e) => setBatchTargetCategory(e.target.value)}
                  className="px-3 py-1.5 bg-indigo-900 border border-indigo-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                >
                  <option value="">-- 카테고리 일괄 선택 --</option>
                  {manageableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleApplyBatchCategory}
                  disabled={!batchTargetCategory}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  일괄 이동
                </button>
              </div>

              {onBatchDelete && (
                <button
                  onClick={() => {
                    onBatchDelete(selectedBookmarkIds);
                    setSelectedBookmarkIds([]);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  선택 삭제
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drag & Drop Instruction Banner */}
      {isDragEnabled && displayBookmarks.length > 1 && (
        <div className="px-4 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
          <span className="flex items-center gap-1.5 font-medium">
            <GripVertical className="w-4 h-4 text-indigo-500" />
            핸들을 잡고 드래그하여 순서를 자유롭게 변경하세요.
          </span>
          <span className="text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 rounded">
            순서 변경 가능
          </span>
        </div>
      )}

      {/* Bookmarks Container */}
      {displayBookmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              조건에 맞는 북마크가 없습니다
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              제목, 코멘트, 태그로 검색하시거나 새로운 타임스탬프 북마크를 추가하세요.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            새 북마크 등록하기
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={displayBookmarks}
          onReorder={(newOrder) => {
            if (isDragEnabled) {
              onReorder(newOrder);
            }
          }}
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5'
              : 'space-y-3 max-w-4xl mx-auto'
          }
        >
          {displayBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onPlay={onPlay}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onSelectCategory={(c) => onFilterChange({ ...filters, selectedCategory: c })}
              onSelectTag={(t) => onFilterChange({ ...filters, selectedTag: t })}
              isDragEnabled={isDragEnabled}
              isSelected={selectedBookmarkIds.includes(bookmark.id)}
              onToggleSelect={handleToggleSelectBookmark}
              isSelectionMode={selectedBookmarkIds.length > 0}
              layoutMode={layoutMode}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};
