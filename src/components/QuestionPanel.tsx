import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { QuizQuestion } from '../types/game';

interface QuestionPanelProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  onContinue: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onContinue,
}) => {
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === question.correctIndex;
  const isFinalQuestion = questionNumber === totalQuestions;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        const keyMap: Record<string, number> = {
          '1': 0,
          a: 0,
          A: 0,
          '2': 1,
          b: 1,
          B: 1,
          '3': 2,
          c: 2,
          C: 2,
          '4': 3,
          d: 3,
          D: 3,
        };
        if (e.key in keyMap) {
          onSelectOption(keyMap[e.key]);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onSelectOption, onContinue]);

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-2xl bg-[rgba(24,16,12,0.95)] border border-[#d4a843]/55 rounded-xl shadow-2xl p-6 text-[#f5efe6] pointer-events-auto">
        {/* Question Header */}
        <div className="flex items-center justify-between gap-4 mb-3 text-xs text-[#d6c7b2]">
          <span className="font-semibold text-[#fbd46d]">
            {question.category ? `${question.category} · ` : ''}
            {isFinalQuestion
              ? `Câu ${questionNumber} / ${totalQuestions} · Trước Điện Thái Hòa`
              : `Trạm khảo thí ${questionNumber} / ${totalQuestions}`}
          </span>
          <span className="text-[#a6957e]">Chọn đáp án A–D hoặc phím 1–4</span>
        </div>

        {/* Question Prompt */}
        <h2 className="font-display text-lg sm:text-xl font-bold text-[#fdf3dc] leading-snug mb-4">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isRightOption = idx === question.correctIndex;

            let btnStyle =
              'bg-[#281c15] hover:bg-[#37261c] border-[#b48a3e]/35 text-[#f5efe6]';

            if (isAnswered) {
              if (isRightOption) {
                btnStyle =
                  'bg-[#064e3b] border-[#34d399] text-[#ecfdf5]';
              } else if (isSelected && !isRightOption) {
                btnStyle =
                  'bg-[#7f1d1d] border-[#f87171] text-[#fef2f2]';
              } else {
                btnStyle =
                  'bg-[#201611] border-[#b48a3e]/15 text-[#9c8c78] opacity-75';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => onSelectOption(idx)}
                className={`text-left px-4 py-3 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
              >
                <span className="font-mono-tabular font-bold text-sm text-[#fbd46d] shrink-0 mt-0.5">
                  {OPTION_LETTERS[idx]}.
                </span>
                <span className="text-sm leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Banner + Next Step Button */}
        {isAnswered && (
          <div className="mt-4 pt-4 border-t border-[#b48a3e]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-[#34d399] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-[#f87171] shrink-0 mt-0.5" />
              )}
              <div>
                <div
                  className={`font-display text-lg font-bold ${
                    isCorrect ? 'text-[#6ee7b7]' : 'text-[#fca5a5]'
                  }`}
                >
                  {isCorrect ? 'Khá lắm! (+1 điểm)' : 'Ngươi thật tệ! (+0 điểm)'}
                </div>
                {question.explanation && (
                  <p className="text-xs text-[#d6c7b2] mt-0.5 leading-relaxed">
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-sm font-semibold border border-[#eab308]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>
                {isFinalQuestion
                  ? isCorrect
                    ? 'Bước vào Điện Thái Hòa'
                    : 'Hoàn thành triều nghi'
                  : 'Tiến lên 5 bước'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
