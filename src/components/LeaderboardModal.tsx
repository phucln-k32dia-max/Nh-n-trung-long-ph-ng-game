import React from 'react';
import { Award, Clock, Trophy, X } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  isLoading: boolean;
  currentEntryId?: string | null;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  isLoading,
  currentEntryId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(12,8,6,0.82)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <div className="w-full max-w-2xl bg-[#1b130e] border border-[#b48a3e]/40 rounded-xl shadow-2xl overflow-hidden text-[#f5efe6]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#b48a3e]/25 bg-[#241811]">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#eab308] shrink-0" />
            <div>
              <h2 id="leaderboard-title" className="font-display text-xl font-bold text-[#fbd46d]">
                Bảng Vàng Khoa Cử — Nhân Trung Long Phượng
              </h2>
              <p className="text-xs text-[#c7b8a1]">
                Xếp hạng theo điểm số cao nhất và thời gian hoàn thành nhanh nhất
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#c7b8a1] hover:text-white hover:bg-[#332319] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#eab308]"
            aria-label="Đóng bảng xếp hạng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto imperial-scroll">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[#c7b8a1]">
              Đang tải dữ liệu bảng vàng...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Award className="w-10 h-10 text-[#b48a3e]/60 mx-auto" />
              <p className="text-base font-medium text-[#f5efe6]">
                Chưa có sĩ tử nào ghi danh bảng vàng.
              </p>
              <p className="text-sm text-[#a6957e]">
                Hãy nhập tên và hoàn thành 20 câu hỏi để lưu danh vào sử sách!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#b48a3e]/25 text-xs text-[#c7b8a1]">
                    <th className="py-2.5 pr-3 font-semibold">Hạng</th>
                    <th className="py-2.5 px-3 font-semibold">Học sinh</th>
                    <th className="py-2.5 px-3 font-semibold">Danh hiệu</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Điểm</th>
                    <th className="py-2.5 pl-3 font-semibold text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b48a3e]/15 text-sm">
                  {entries.map((entry, idx) => {
                    const isCurrent = currentEntryId === entry.id;
                    return (
                      <tr
                        key={entry.id}
                        className={
                          isCurrent
                            ? 'bg-[#854d0e]/25 text-[#fef3c7]'
                            : 'hover:bg-[#281c14] transition-colors'
                        }
                      >
                        <td className="py-3 pr-3 font-mono-tabular font-bold text-[#fbd46d]">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {entry.studentName}
                          {isCurrent && (
                            <span className="ml-2 text-xs text-[#fde047]">(Bạn)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#d6c7b2]">{entry.rankTitle}</td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-semibold text-[#86efac]">
                          {entry.score}/{entry.totalQuestions}
                        </td>
                        <td className="py-3 pl-3 text-right font-mono-tabular text-[#c7b8a1]">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            {formatDuration(entry.timeSpentSeconds)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#b48a3e]/20 bg-[#160f0b] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-[#2e2118] hover:bg-[#3d2b1f] text-[#f5efe6] border border-[#b48a3e]/30 transition-colors whitespace-nowrap shrink-0"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
