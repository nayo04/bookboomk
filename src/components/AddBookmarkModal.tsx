import React, { useState, useEffect } from 'react';
import { MediaBookmark } from '../types';
import {
  parseMediaUrl,
  secondsToHMS,
  hmsToSeconds,
  formatSecondsToHHMMSS,
  PRESET_CATEGORIES,
} from '../utils/mediaUtils';
import {
  X,
  Plus,
  Clock,
  Link,
  Folder,
  Tv,
  Twitter,
  AlertCircle,
  Check,
  FileText,
  Video,
  FileCode2,
  Tag,
  Trash2,
  Edit3
} from 'lucide-react';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<MediaBookmark, 'id' | 'createdAt'> & { id?: string }) => void;
  editingBookmark?: MediaBookmark | null;
  customCategories: string[];
  onAddCustomCategory: (cat: string) => void;
  onRenameCategory?: (oldName: string, newName: string) => void;
  onDeleteCategory?: (catName: string) => void;
}

interface TimePickerProps {
  label: string;
  totalSeconds: number;
  onChange: (sec: number) => void;
}

const TimePickerHMS: React.FC<TimePickerProps> = ({ label, totalSeconds, onChange }) => {
  const { hours, minutes, seconds } = secondsToHMS(totalSeconds);

  const handleHChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange(hmsToSeconds(isNaN(val) ? 0 : val, minutes, seconds));
  };

  const handleMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange(hmsToSeconds(hours, isNaN(val) ? 0 : val, seconds));
  };

  const handleSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange(hmsToSeconds(hours, minutes, isNaN(val) ? 0 : val));
  };

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
        {label}
      </span>
      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="99"
            value={hours || ''}
            onChange={handleHChange}
            placeholder="00"
            className="w-12 text-center py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
          <span className="text-xs font-semibold text-slate-500">시간</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="59"
            value={minutes || ''}
            onChange={handleMChange}
            placeholder="00"
            className="w-12 text-center py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
          <span className="text-xs font-semibold text-slate-500">분</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="59"
            value={seconds || ''}
            onChange={handleSChange}
            placeholder="00"
            className="w-12 text-center py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
          <span className="text-xs font-semibold text-slate-500">초</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-mono">
        (hh:mm:ss → {formatSecondsToHHMMSS(totalSeconds)})
      </p>
    </div>
  );
};

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBookmark,
  customCategories,
  onAddCustomCategory,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [startSec, setStartSec] = useState(0);
  const [hasEndSec, setHasEndSec] = useState(false);
  const [endSec, setEndSec] = useState(0);

  const [category, setCategory] = useState(PRESET_CATEGORIES[1]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [comment, setComment] = useState('');
  const [hasVideo, setHasVideo] = useState(true);

  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const [parsed, setParsed] = useState(() => parseMediaUrl(''));
  const [formError, setFormError] = useState('');

  // Load editing bookmark data if provided
  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setStartSec(editingBookmark.startTime || 0);

      if (editingBookmark.endTime !== null && editingBookmark.endTime !== undefined) {
        setHasEndSec(true);
        setEndSec(editingBookmark.endTime);
      } else {
        setHasEndSec(false);
        setEndSec(0);
      }

      setCategory(editingBookmark.category);
      setTags(editingBookmark.tags || []);
      setTagInput('');
      setComment(editingBookmark.comment || '');
      setHasVideo(editingBookmark.hasVideo ?? true);
      setParsed(parseMediaUrl(editingBookmark.url));
    } else {
      resetForm();
    }
  }, [editingBookmark, isOpen]);

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setStartSec(0);
    setHasEndSec(false);
    setEndSec(0);
    setCategory(PRESET_CATEGORIES[1]);
    setTags([]);
    setTagInput('');
    setComment('');
    setHasVideo(true);
    setParsed(parseMediaUrl(''));
    setFormError('');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setFormError('');

    const res = parseMediaUrl(newUrl);
    setParsed(res);

    if (res.isValid) {
      if (res.platform === 'youtube') {
        setHasVideo(true);
      }
      if (res.startTime && res.startTime > 0) {
        setStartSec(res.startTime);
      }
      if (!title) {
        if (res.platform === 'youtube') {
          setTitle(`유튜브 영상 (ID: ${res.embedId})`);
        } else {
          setTitle(`트위터(X) 게시물 (${res.embedId})`);
        }
      }
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateCategory = () => {
    const cat = newCatInput.trim();
    if (cat) {
      onAddCustomCategory(cat);
      setCategory(cat);
      setNewCatInput('');
      setShowNewCatInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed.isValid) {
      setFormError('올바른 유튜브(watch, live, shorts 등) 또는 트위터 링크를 입력해 주세요.');
      return;
    }
    if (!title.trim()) {
      setFormError('제목을 입력해 주세요.');
      return;
    }

    const finalEndSec = hasEndSec && endSec > 0 ? endSec : null;

    if (finalEndSec !== null && finalEndSec <= startSec) {
      setFormError('종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }

    onSave({
      id: editingBookmark?.id,
      platform: parsed.platform,
      url: url.trim(),
      embedId: parsed.embedId,
      title: title.trim(),
      comment: comment.trim(),
      category: category || '기타',
      tags: tags,
      startTime: parsed.platform === 'youtube' || hasVideo ? startSec : 0,
      endTime: parsed.platform === 'youtube' || hasVideo ? finalEndSec : null,
      hasVideo: parsed.platform === 'youtube' ? true : hasVideo,
      thumbnailUrl: parsed.thumbnailUrl,
    });

    onClose();
  };

  const allCategories = Array.from(
    new Set([...PRESET_CATEGORIES.filter((c) => c !== '전체'), ...customCategories])
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingBookmark ? '북마크 및 구간 수정' : '새 미디어 북마크 추가'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                유튜브 재생 구간(시:분:초) 및 트위터 링크를 작성하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Media URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-indigo-500" />
              영상 / 게시물 주소 (URL) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://www.youtube.com/live/_2vEEfh2D2c 또는 https://x.com/username/status/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder:text-slate-400"
              />
              {parsed.isValid && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Check className="w-3 h-3" />
                  {parsed.platform === 'youtube' ? 'YouTube' : 'Twitter'} 인식 완료
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              💡 유튜브 라이브(live), 일반 영상(watch), 숏폼(shorts), 공유링크(youtu.be) 모두 정상 지원합니다.
            </p>
          </div>

          {/* Twitter Video vs Text Toggle */}
          {parsed.platform === 'twitter' && (
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/50 space-y-2">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-200 block">
                트위터(X) 게시물 유형 선택
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHasVideo(true)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                    hasVideo
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  🎥 동영상 포함 (구간 재생 설정)
                </button>

                <button
                  type="button"
                  onClick={() => setHasVideo(false)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                    !hasVideo
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <FileCode2 className="w-4 h-4" />
                  📝 텍스트/이미지 전용 (프로필 썸네일)
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              제목 / 클립 이름 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 00시 01분 23초 명장면 구간, 라이브 요약 등"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>

          {/* Timepicker HMS (For YouTube or Twitter with Video) */}
          {(parsed.platform === 'youtube' || hasVideo) && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  재생 구간 설정 (시 : 분 : 초)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimePickerHMS
                  label="시작 시간 (Start Time)"
                  totalSeconds={startSec}
                  onChange={setStartSec}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      종료 시간 (End Time)
                    </span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      <input
                        type="checkbox"
                        checked={hasEndSec}
                        onChange={(e) => setHasEndSec(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      종료 시간 설정하기
                    </label>
                  </div>

                  {hasEndSec ? (
                    <TimePickerHMS
                      label=""
                      totalSeconds={endSec}
                      onChange={setEndSec}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 py-3 italic">
                      미설정 시 끝까지 계속 재생됩니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Category Selector & Add New Category */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-indigo-500" />
                카테고리 선택
              </label>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                + 새 카테고리 추가
              </button>
            </div>

            {showNewCatInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="새 카테고리 이름 입력"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500"
                >
                  등록
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tag System */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              태그 설정 (엔터 또는 쉼표 입력)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="예: 음악, 명장면, 꿀팁 (입력 후 엔터)"
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
              >
                추가
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments & Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              구간 메모 및 코멘트
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="해당 시간대에 어떤 내용이 들어있는지, 주요 요약이나 개인 메모를 작성해 주세요."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              {editingBookmark ? '수정 완료' : '북마크 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
