'use client';

import React, { useEffect } from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { sounds } from '@/utils/audio';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playPop();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f1015]/60 backdrop-blur-md transition-opacity duration-200"
        onClick={() => {
          sounds.playPop();
          onClose();
        }}
      />

      {/* Modal Dialog (Rectilinear aesthetic, sharp corners, frosted glass) */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white/95 border border-white shadow-2xl backdrop-blur-2xl z-10 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#ef4444]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#e5e7eb]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 border border-red-200">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider uppercase text-[#121218]">
                Làm mới bộ nhớ
              </h3>
              <p className="text-[11px] text-[#6b7280]">
                QuackQuack Studio Data Reset
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center text-[#6b7280] hover:text-[#121218] hover:bg-neutral-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 bg-red-50/70 border border-red-100 text-xs text-red-900 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>
              Thao tác này sẽ xóa vĩnh viễn các dữ liệu đã lưu trong <strong>LocalStorage</strong> trên trình duyệt của bạn.
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#4b5563]">
            <p className="font-semibold text-[#1f2937]">Dữ liệu sẽ được đặt lại:</p>
            <ul className="list-none space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#8b5cf6]" />
                <span>Điểm kỷ lục bắn vịt: trở về <strong>0 điểm</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#8b5cf6]" />
                <span>Số lượng ảnh Photobooth đã lưu: trở về <strong>0</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#8b5cf6]" />
                <span>Các danh hiệu thành tích sẽ bị khóa lại</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 p-4 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-[#4b5563] bg-white border border-[#d1d5db] hover:bg-neutral-50 hover:text-[#111827] transition-all"
          >
            HỦY BỎ
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              sounds.playPop();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-[#111217] hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>XÁC NHẬN LÀM MỚI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
