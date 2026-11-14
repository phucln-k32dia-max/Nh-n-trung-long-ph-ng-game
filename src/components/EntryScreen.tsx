import React, { useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileUp, Trophy, User } from 'lucide-react';
import { parseQuestionsFromFile } from '../data/questions';
import { QuizQuestion } from '../types/game';

interface EntryScreenProps {
  studentName: string;
  onChangeName: (name: string) => void;
  questions: QuizQuestion[];
  customSourceLabel: string | null;
  onLoadCustomQuestions: (questions: QuizQuestion[], fileName: string) => void;
  onResetDefaultQuestions: () => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  topEntryCount: number;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({
  studentName,
  onChangeName,
  questions,
  customSourceLabel,
  onLoadCustomQuestions,
  onResetDefaultQuestions,
  onStartGame,
  onOpenLeaderboard,
  topEntryCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setNameError('Vui lòng nhập họ tên học sinh trước khi vào triều.');
      return;
    }
    setNameError(null);
    onStartGame();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseQuestionsFromFile(text, file.name);
      if (parsed.length === 0) {
        setUploadMessage(
          'Không nhận diện được câu hỏi từ tệp. Vui lòng dùng định dạng TXT ("Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A"), CSV hoặc JSON.',
        );
      } else {
        onLoadCustomQuestions(parsed, file.name);
        setUploadMessage(`Đã nạp thành công ${parsed.length} câu hỏi từ "${file.name}".`);
      }
    } catch {
      setUploadMessage('Không thể đọc tệp đã chọn.');
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-6 bg-[rgba(14,9,6,0.68)]">
      <div className="w-full max-w-xl bg-[#19110c] border border-[#c89b44]/45 rounded-xl shadow-2xl p-8 text-[#f5efe6]">
        {/* Header Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="text-xs tracking-widest text-[#e5b84b] font-semibold">
            人中龍鳳 · TRIỀU NGUYỄN THẾ KỶ XIX
          </div>
          <h1
            className="font-display text-3xl sm:text-4xl font-bold text-[#fdf3dc] leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Nhân Trung Long Phượng
          </h1>
          <p className="text-sm text-[#c7b8a1] max-w-md mx-auto">
            Nhập vai quan lại mặc áo thụng Ngọc Bích, yết kiến Hoàng đế, vượt qua cổng Ngọ Môn và
            chinh phục 20 câu hỏi tiến vào Điện Thái Hòa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Name Field */}
          <div>
            <label
              htmlFor="student-name"
              className="block text-sm font-medium text-[#ebd8b7] mb-1.5"
            >
              Tên học sinh dự thi
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#b48a3e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="student-name"
                type="text"
                maxLength={50}
                value={studentName}
                onChange={(e) => {
                  onChangeName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Ví dụ: Nguyễn Minh Khôi - Lớp 8A"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#261a13] border border-[#b48a3e]/40 text-[#fdf3dc] placeholder:text-[#8c7a64] focus:outline-none focus:border-[#eab308]"
                autoFocus
              />
            </div>
            {nameError && (
              <p className="mt-1.5 text-xs text-[#fca5a5]">{nameError}</p>
            )}
          </div>

          {/* Quiz Bank Info & Optional File Import */}
          <div className="p-4 rounded-lg bg-[#231811] border border-[#b48a3e]/25 space-y-2.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-[#e7d8c1]">
                <BookOpen className="w-4 h-4 text-[#eab308] shrink-0" />
                <span>
                  {customSourceLabel
                    ? `Bộ đề tùy chỉnh: ${customSourceLabel}`
                    : 'Bộ đề Lịch sử & Văn hóa (20 câu đính kèm)'}
                </span>
                <span aria-hidden="true" className="text-[#8c7a64]">
                  ·
                </span>
                <span className="font-mono-tabular text-[#fbd46d]">
                  {questions.length} câu · 10:00
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#332319] hover:bg-[#442f22] text-[#f5efe6] border border-[#b48a3e]/35 transition-colors whitespace-nowrap shrink-0"
                >
                  <FileUp className="w-3.5 h-3.5 text-[#eab308]" />
                  Nạp tệp câu hỏi
                </button>
                {customSourceLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetDefaultQuestions();
                      setUploadMessage(null);
                    }}
                    className="px-2.5 py-1.5 text-xs text-[#c7b8a1] hover:text-white underline whitespace-nowrap shrink-0"
                  >
                    Mặc định
                  </button>
                )}
              </div>
            </div>
            {uploadMessage && (
              <p className="text-xs text-[#fde68a]">{uploadMessage}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-[#fff8eb] font-semibold text-base border border-[#eab308]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Vào Triều Yết Kiến</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2a1d15] hover:bg-[#38271d] text-[#fbd46d] font-medium text-sm border border-[#b48a3e]/35 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trophy className="w-4 h-4" />
              <span>Bảng xếp hạng ({topEntryCount})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
