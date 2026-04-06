"use client";

import { useEffect, useRef } from "react";
import { useNotification, NOTIFICATION_CATEGORIES } from "@/contexts/NotificationContext";

interface Props {
  onClose: () => void;
}

export default function NotificationModal({ onClose }: Props) {
  const { isEnabled, categories, isLoading, enable, disable, updateCategories } = useNotification();
  const overlayRef = useRef<HTMLDivElement>(null);

  // 배경 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleMasterToggle = async () => {
    if (isEnabled) {
      await disable();
    } else {
      await enable();
    }
  };

  const handleCategoryToggle = async (catId: string) => {
    const next = categories.includes(catId)
      ? categories.filter((c) => c !== catId)
      : [...categories, catId];
    await updateCategories(next);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full sm:w-96 bg-[var(--bg)] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <span className="font-bold text-[var(--text)]">새 공고 알림</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 마스터 토글 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--text)] text-sm">알림 받기</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isEnabled ? "공고 등록일 기준으로 매 정시 확인해요" : "새 공고가 올라오면 알려드려요"}
              </p>
            </div>
            <button
              onClick={handleMasterToggle}
              disabled={isLoading}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                isEnabled ? "bg-brand-400" : "bg-gray-300 dark:bg-gray-600"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={isEnabled ? "알림 끄기" : "알림 켜기"}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  isEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 카테고리 선택 */}
          {isEnabled && (
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">알림 받을 동물</p>
              <div className="space-y-1">
                {NOTIFICATION_CATEGORIES.map((cat) => {
                  const checked = categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      disabled={isLoading}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm ${
                        checked
                          ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                          : "hover:bg-[var(--border)] text-[var(--text-muted)]"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked
                            ? "bg-brand-400 border-brand-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {categories.length === 0 && (
                <p className="text-xs text-amber-500 mt-2 px-1">최소 1개 이상 선택해야 알림이 와요.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
