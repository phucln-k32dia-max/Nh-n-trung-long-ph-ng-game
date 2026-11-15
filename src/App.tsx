import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Footprints,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import { EntryScreen } from './components/EntryScreen';
import { formatDuration, LeaderboardModal } from './components/LeaderboardModal';
import { QuestionPanel } from './components/QuestionPanel';
import { DEFAULT_QUESTIONS, EMPEROR_DIALOGUE, getImperialRank } from './data/questions';
import { HueCitadelViewport } from './three/HueCitadelViewport';
import { GamePhase, LeaderboardEntry } from './types/game';

const EXAM_DURATION_SECONDS = 600; // 10 phút đếm ngược
const STEPS_PER_QUESTION = 5;
const LOCAL_LEADERBOARD_KEY = 'nhan_trung_long_phuong_leaderboard_v1';

function readLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalLeaderboard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    // ignore storage quota errors
  }
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('entry');
  const [studentName, setStudentName] = useState('');
  const questions = DEFAULT_QUESTIONS;

  // Dialogue & Gate States
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [gatesOpen, setGatesOpen] = useState(false);
  const [hallDoorsOpen, setHallDoorsOpen] = useState(false);

  // Quiz & Movement Progress
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stepsInSegment, setStepsInSegment] = useState(0);
  const [isWalkingStep, setIsWalkingStep] = useState(false);
  const [isAutoStepping, setIsAutoStepping] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answeredFinalCorrect, setAnsweredFinalCorrect] = useState(false);

  // Timer & Sound
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [muted, setMuted] = useState(false);

  // Reward Panel Collapse & Leaderboard
  const [rewardCollapsed, setRewardCollapsed] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);

  const totalQuestions = questions.length;
  const totalStepsMoved = questionIndex * STEPS_PER_QUESTION + stepsInSegment;

  // Fetch initial leaderboard from backend with localStorage fallback
  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = (await res.json()) as { entries?: LeaderboardEntry[] };
        if (Array.isArray(data.entries)) {
          setLeaderboard(data.entries);
          saveLocalLeaderboard(data.entries);
          setLeaderboardLoading(false);
          return;
        }
      }
    } catch {
      // fall back to localStorage
    }
    setLeaderboard(readLocalLeaderboard());
    setLeaderboardLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const submitScoreToLeaderboard = useCallback(
    async (finalScore: number, elapsedSec: number) => {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      const trimmedName = studentName.trim() || 'Quan lại ẩn danh';
      const rankTitle = getImperialRank(finalScore, totalQuestions);
      const localEntry: LeaderboardEntry = {
        id: `local-${Date.now()}`,
        studentName: trimmedName,
        score: finalScore,
        totalQuestions,
        timeSpentSeconds: Math.max(1, elapsedSec),
        rankTitle,
        completedAt: new Date().toISOString(),
      };

      try {
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: trimmedName,
            score: finalScore,
            totalQuestions,
            timeSpentSeconds: Math.max(1, elapsedSec),
            rankTitle,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            entry?: LeaderboardEntry;
            entries?: LeaderboardEntry[];
          };
          if (data.entry) setLastSubmittedId(data.entry.id);
          if (Array.isArray(data.entries)) {
            setLeaderboard(data.entries);
            saveLocalLeaderboard(data.entries);
            return;
          }
        }
      } catch {
        // fall through to local save
      }

      const merged = [...readLocalLeaderboard(), localEntry].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpentSeconds - b.timeSpentSeconds;
      });
      saveLocalLeaderboard(merged);
      setLeaderboard(merged);
      setLastSubmittedId(localEntry.id);
    },
    [studentName, totalQuestions],
  );

  // 10-minute countdown timer
  useEffect(() => {
    if (!timerActive) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setTimerActive(false);
          setTimedOut(true);
          setHallDoorsOpen(true);
          setPhase('reward');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerActive]);

  // Submit score automatically upon reaching 'reward'
  useEffect(() => {
    if (phase === 'reward') {
      const elapsed = EXAM_DURATION_SECONDS - timeLeft;
      submitScoreToLeaderboard(score, elapsed);
    }
  }, [phase, score, timeLeft, submitScoreToLeaderboard]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  // Reset & start from Entry Screen -> Scene 1: Emperor Dialogue
  const handleStartFromEntry = () => {
    soundEngine.playClick();
    hasSubmittedRef.current = false;
    setLastSubmittedId(null);
    setDialogueIndex(0);
    setGatesOpen(false);
    setHallDoorsOpen(false);
    setQuestionIndex(0);
    setStepsInSegment(0);
    setSelectedOption(null);
    setScore(0);
    setAnsweredFinalCorrect(false);
    setTimeLeft(EXAM_DURATION_SECONDS);
    setTimerActive(false);
    setTimedOut(false);
    setRewardCollapsed(false);
    setPhase('dialogue');
  };

  // Scene 1: Advance Emperor Dialogue via Bottom-Right Arrow Button
  const handleNextDialogue = useCallback(() => {
    soundEngine.playClick();
    if (dialogueIndex < EMPEROR_DIALOGUE.length - 1) {
      setDialogueIndex((prev) => prev + 1);
    } else {
      // Transition to Ngọ Môn gate screen
      setPhase('ngo_mon');
    }
  }, [dialogueIndex]);

  useEffect(() => {
    if (phase !== 'dialogue') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNextDialogue();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, handleNextDialogue]);

  // Scene 2: Click "Bắt đầu" right in front of Ngọ Môn Gate
  const handleEnterNgoMon = () => {
    if (phase !== 'ngo_mon') return;
    setGatesOpen(true);
    soundEngine.playGateOpen();
    setTimerActive(true);

    // Wait briefly as heavy gates swing open, then stride through Ngọ Môn
    window.setTimeout(() => {
      setPhase('entering');
      soundEngine.playStep(1);
    }, 650);

    window.setTimeout(() => {
      soundEngine.playStep(2);
      setPhase('walking');
    }, 1850);
  };

  // Scene 3: Take 1 step forward (up to 5 steps per question)
  const takeOneStep = useCallback(() => {
    if (phase !== 'walking') return;
    setStepsInSegment((prev) => {
      if (prev >= STEPS_PER_QUESTION) return prev;
      const next = prev + 1;
      soundEngine.playStep(next);
      setIsWalkingStep(true);
      window.setTimeout(() => setIsWalkingStep(false), 210);

      if (next >= STEPS_PER_QUESTION) {
        setIsAutoStepping(false);
        window.setTimeout(() => {
          setPhase('question');
        }, 280);
      }
      return next;
    });
  }, [phase]);

  // Auto-step helper so students can stride 5 steps smoothly with one click or hold W/Up
  useEffect(() => {
    if (phase !== 'walking' || !isAutoStepping) return;
    if (stepsInSegment >= STEPS_PER_QUESTION) {
      setIsAutoStepping(false);
      return;
    }
    const timer = window.setTimeout(() => {
      takeOneStep();
    }, 280);
    return () => window.clearTimeout(timer);
  }, [phase, isAutoStepping, stepsInSegment, takeOneStep]);

  // Keyboard W / ArrowUp / Space to step forward during walking phase
  useEffect(() => {
    if (phase !== 'walking') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        takeOneStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, takeOneStep]);

  // Handle Answer Selection
  const handleSelectOption = useCallback(
    (optIdx: number) => {
      if (selectedOption !== null) return;
      const currentQ = questions[questionIndex];
      if (!currentQ) return;

      setSelectedOption(optIdx);
      const isRight = optIdx === currentQ.correctIndex;
      if (isRight) {
        soundEngine.playCorrect();
        setScore((s) => s + 1);
        if (questionIndex === totalQuestions - 1) {
          setAnsweredFinalCorrect(true);
        }
      } else {
        soundEngine.playWrong();
      }
    },
    [selectedOption, questions, questionIndex, totalQuestions],
  );

  // Continue after answering question
  const handleContinueAfterAnswer = useCallback(() => {
    if (selectedOption === null) return;
    soundEngine.playClick();

    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((q) => q + 1);
      setStepsInSegment(0);
      setSelectedOption(null);
      setPhase('walking');
    } else {
      // Completed Question 20 in front of Điện Thái Hòa!
      setTimerActive(false);
      setHallDoorsOpen(true);
      soundEngine.playRoyalFanfare();
      setPhase('entering_hall');

      window.setTimeout(() => {
        setPhase('reward');
      }, 1500);
    }
  }, [selectedOption, questionIndex, totalQuestions]);

  const handleRestartToEntry = () => {
    soundEngine.playClick();
    setTimerActive(false);
    setGatesOpen(false);
    setHallDoorsOpen(false);
    setIsAutoStepping(false);
    setPhase('entry');
  };

  const activeDialogue = EMPEROR_DIALOGUE[dialogueIndex];
  const currentQuestion = questions[questionIndex];

  const timerColorClass = useMemo(() => {
    if (timeLeft <= 60) return 'text-[#fca5a5]';
    if (timeLeft <= 120) return 'text-[#fde047]';
    return 'text-[#fdf3dc]';
  }, [timeLeft]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#120d0a]">
      {/* Full-screen 3D Hue Imperial Citadel Viewport */}
      <HueCitadelViewport
        phase={phase}
        totalStepsMoved={totalStepsMoved}
        maxSteps={totalQuestions * STEPS_PER_QUESTION}
        gatesOpen={gatesOpen}
        hallDoorsOpen={hallDoorsOpen}
        isWalkingStep={isWalkingStep}
        isCommended={answeredFinalCorrect || score >= Math.ceil(totalQuestions * 0.5)}
      />

      {/* Top HUD Bar (shown during active game phases) */}
      {phase !== 'entry' && (
        <header className="fixed top-0 inset-x-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 pointer-events-none">
          {/* Left: Student Name & Distinctive Áo Thụng Role */}
          <div className="bg-[rgba(22,14,10,0.88)] border border-[#b48a3e]/40 rounded-lg px-4 py-2 text-xs sm:text-sm text-[#f5efe6] pointer-events-auto flex items-center gap-3 min-w-0">
            <span
              className="w-3 h-3 rounded-sm bg-[#0d7a6f] border border-[#f5c542] shrink-0"
              title="Áo thụng Ngọc Bích"
            />
            <span className="font-semibold text-[#fdf3dc] truncate max-w-[160px] sm:max-w-[240px]">
              {studentName || 'Quan lại'}
            </span>
            <span aria-hidden="true" className="text-[#8c7a64] hidden sm:inline">
              ·
            </span>
            <span className="text-[#d6c7b2] hidden sm:inline whitespace-nowrap">
              Áo thụng Ngọc Bích
            </span>
          </div>

          {/* Center: Countdown Clock & Score */}
          {(phase === 'entering' ||
            phase === 'walking' ||
            phase === 'question' ||
            phase === 'entering_hall' ||
            phase === 'reward') && (
            <div className="bg-[rgba(22,14,10,0.9)] border border-[#d4a843]/45 rounded-lg px-4 py-2 flex items-center gap-4 text-xs sm:text-sm pointer-events-auto">
              <div className={`inline-flex items-center gap-1.5 font-mono-tabular font-bold ${timerColorClass}`}>
                <Clock className="w-4 h-4 text-[#eab308]" />
                <span>{formatDuration(timeLeft)}</span>
              </div>
              <span aria-hidden="true" className="text-[#6e5c47]">
                |
              </span>
              <div className="font-mono-tabular text-[#fdf3dc] whitespace-nowrap">
                Điểm: <span className="font-bold text-[#6ee7b7]">{score}</span>/{totalQuestions}
              </div>
              <span aria-hidden="true" className="text-[#6e5c47] hidden md:inline">
                |
              </span>
              <div className="font-mono-tabular text-[#fbd46d] hidden md:block whitespace-nowrap">
                Câu {Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions}
              </div>
            </div>
          )}

          {/* Right: Mute & Leaderboard */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setLeaderboardOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[rgba(22,14,10,0.88)] hover:bg-[#2c1d14] border border-[#b48a3e]/40 text-xs font-medium text-[#fbd46d] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Bảng xếp hạng</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg bg-[rgba(22,14,10,0.88)] hover:bg-[#2c1d14] border border-[#b48a3e]/40 text-[#f5efe6] transition-colors cursor-pointer"
              aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-[#fca5a5]" /> : <Volume2 className="w-4 h-4 text-[#fbd46d]" />}
            </button>
          </div>
        </header>
      )}

      {/* ENTRY SCREEN */}
      {phase === 'entry' && (
        <EntryScreen
          studentName={studentName}
          onChangeName={setStudentName}
          totalQuestions={totalQuestions}
          onStartGame={handleStartFromEntry}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          topEntryCount={leaderboard.length}
        />
      )}

      {/* SCENE 1: EMPEROR DIALOGUE WITH BOTTOM-RIGHT ARROW BUTTON */}
      {phase === 'dialogue' && activeDialogue && (
        <div className="fixed inset-x-0 bottom-5 z-20 flex justify-center px-4 pointer-events-none">
          <div className="relative w-full max-w-3xl bg-[rgba(24,15,10,0.94)] border border-[#d4a843]/55 rounded-xl shadow-2xl p-6 pr-20 text-[#f5efe6] pointer-events-auto">
            <div className="flex items-center gap-3 mb-2 text-xs">
              <span
                className={`font-bold tracking-wide ${
                  activeDialogue.speaker === 'Vua' ? 'text-[#facc15]' : 'text-[#5eead4]'
                }`}
              >
                {activeDialogue.roleLabel}
              </span>
              <span aria-hidden="true" className="text-[#786550]">
                ·
              </span>
              <span className="text-[#a6957e] font-mono-tabular">
                {dialogueIndex + 1} / {EMPEROR_DIALOGUE.length}
              </span>
            </div>

            <p className="font-display text-lg sm:text-xl leading-relaxed text-[#fdf6e7]">
              “{activeDialogue.text}”
            </p>

            {/* Bottom-right Arrow Button to advance to next speaker */}
            <button
              type="button"
              onClick={handleNextDialogue}
              aria-label={
                dialogueIndex < EMPEROR_DIALOGUE.length - 1
                  ? 'Chuyển sang lời thoại tiếp theo'
                  : 'Tiến tới cổng Ngọ Môn'
              }
              title={
                dialogueIndex < EMPEROR_DIALOGUE.length - 1
                  ? 'Lời thoại tiếp theo'
                  : 'Tới cổng Ngọ Môn'
              }
              className="absolute right-4 bottom-4 w-12 h-12 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-[#fff8eb] border border-[#eab308]/60 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* SCENE 2: NGỌ MÔN GATE WITH START BUTTON RIGHT IN FRONT OF THE DOOR */}
      {phase === 'ngo_mon' && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-end pb-14 px-4 pointer-events-none">
          <div className="bg-[rgba(22,14,10,0.9)] border border-[#d4a843]/55 rounded-xl px-7 py-5 text-center space-y-3 pointer-events-auto max-w-md shadow-2xl">
            <div className="text-xs font-semibold tracking-wider text-[#fbd46d]">
              CỔNG NGỌ MÔN · HOÀNG THÀNH HUẾ
            </div>
            <p className="text-sm text-[#e7d8c1]">
              Cánh cổng Ngọ Môn đang khép kín. Nhấn <strong>Bắt đầu</strong> để mở cổng tiến vào
              Kinh thành Huế và tính giờ 10 phút.
            </p>
            <button
              type="button"
              onClick={handleEnterNgoMon}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white font-display text-lg font-bold border-2 border-[#f5c542] shadow-xl transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>Bắt đầu</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* TRANSITION BANNER WHEN STEPPING THROUGH NGỌ MÔN OR ĐIỆN THÁI HÒA */}
      {(phase === 'entering' || phase === 'entering_hall') && (
        <div className="fixed bottom-8 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="bg-[rgba(22,14,10,0.88)] border border-[#d4a843]/45 rounded-lg px-6 py-3 text-sm font-medium text-[#fdf3dc]">
            {phase === 'entering'
              ? 'Cổng Ngọ Môn đã mở — Đang bước vào Kinh thành Huế...'
              : 'Cửa Điện Thái Hòa mở rộng — Đang tiến vào bệ kiến Hoàng Đế...'}
          </div>
        </div>
      )}

      {/* SCENE 3A: WALKING FORWARD 5 STEPS IN FIRST-PERSON */}
      {phase === 'walking' && (
        <div className="fixed bottom-5 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-xl bg-[rgba(22,14,10,0.92)] border border-[#d4a843]/50 rounded-xl px-5 py-4 text-[#f5efe6] pointer-events-auto shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <div className="text-xs font-semibold text-[#fbd46d]">
                  {questionIndex === totalQuestions - 1
                    ? 'Tiến tới trước Điện Thái Hòa'
                    : `Hướng tới trạm câu hỏi ${questionIndex + 1} / ${totalQuestions}`}
                </div>
                <div className="text-xs text-[#c7b8a1] mt-0.5">
                  Kéo chuột để quan sát Kinh thành Huế · Bấm phím W / ↑ hoặc nút bên dưới
                </div>
              </div>
              <div className="font-mono-tabular text-sm font-bold text-[#5eead4] whitespace-nowrap">
                {stepsInSegment} / {STEPS_PER_QUESTION} bước
              </div>
            </div>

            {/* 5-step progress segments */}
            <div className="grid grid-cols-5 gap-2 mb-3.5">
              {Array.from({ length: STEPS_PER_QUESTION }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-sm transition-colors ${
                    idx < stepsInSegment ? 'bg-[#eab308]' : 'bg-[#3a2a1e]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={takeOneStep}
                disabled={stepsInSegment >= STEPS_PER_QUESTION}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0d7a6f] hover:bg-[#0f8f82] text-white font-semibold text-sm border border-[#f5c542]/45 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Footprints className="w-4 h-4" />
                <span>Bước tiến (+1 bước)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAutoStepping(true)}
                disabled={isAutoStepping || stepsInSegment >= STEPS_PER_QUESTION}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2e2118] hover:bg-[#3f2d21] text-[#fbd46d] font-medium text-sm border border-[#b48a3e]/40 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <span>Đi đủ 5 bước</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCENE 3B: QUIZ QUESTION PANEL */}
      {phase === 'question' && currentQuestion && (
        <QuestionPanel
          question={currentQuestion}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestions}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          onContinue={handleContinueAfterAnswer}
        />
      )}

      {/* SCENE 4: THIRD-PERSON PANORAMA INSIDE ĐIỆN THÁI HÒA + ROYAL COMMENDATION */}
      {phase === 'reward' && (
        <div className="fixed bottom-4 inset-x-0 z-20 flex flex-col items-center px-4 pointer-events-none">
          <button
            type="button"
            onClick={() => setRewardCollapsed((c) => !c)}
            className="mb-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[rgba(22,14,10,0.9)] hover:bg-[#2c1d14] border border-[#d4a843]/45 text-xs font-medium text-[#fbd46d] pointer-events-auto cursor-pointer"
          >
            {rewardCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hiện bảng khen thưởng</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Thu gọn để ngắm toàn cảnh Điện Thái Hòa</span>
              </>
            )}
          </button>

          {!rewardCollapsed && (
            <div className="w-full max-w-2xl bg-[rgba(22,14,10,0.94)] border border-[#d4a843]/60 rounded-xl shadow-2xl p-6 text-[#f5efe6] pointer-events-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#b48a3e]/25 pb-4 mb-4">
                <div>
                  <div className="text-xs font-semibold tracking-wider text-[#facc15]">
                    {timedOut
                      ? 'ĐÃ HẾT THỜI GIAN 10 PHÚT'
                      : 'ĐIỆN THÁI HÒA · GÓC NHÌN THỨ BA'}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[#fdf3dc] mt-1">
                    {answeredFinalCorrect || score >= Math.ceil(totalQuestions * 0.5)
                      ? 'Hoàng Đế Ban Thưởng — Nhân Trung Long Phượng'
                      : 'Hoàn Thành Kỳ Thi Khoa Cử'}
                  </h2>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-[#c7b8a1]">Danh hiệu sắc phong</div>
                  <div className="font-display text-xl font-bold text-[#6ee7b7]">
                    {getImperialRank(score, totalQuestions)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#e7d8c1] leading-relaxed mb-4">
                {answeredFinalCorrect
                  ? `“Khá lắm, ${studentName || 'ái khanh'}! Khanh đã xuất sắc trả lời đúng câu hỏi cuối cùng trước Điện Thái Hòa, xứng danh bậc nhân tài triều Nguyễn.”`
                  : timedOut
                    ? `Thời gian 10 phút đã kết thúc. Triều đình ghi nhận thành tích của ${studentName || 'sĩ tử'} trên bảng vàng.`
                    : `Triều đình ghi nhận nỗ lực của ${studentName || 'sĩ tử'} tại kỳ thi Nhân Trung Long Phượng. Hãy tiếp tục ôn luyện Tin học để đạt danh hiệu cao hơn!`}
              </p>

              {/* Summary metrics (clean unboxed tabular layout) */}
              <div className="grid grid-cols-3 gap-4 py-3 px-4 rounded-lg bg-[#241811] border border-[#b48a3e]/25 mb-5 text-center">
                <div>
                  <div className="text-xs text-[#a6957e]">Học sinh</div>
                  <div className="text-sm font-semibold text-[#fdf3dc] truncate mt-0.5">
                    {studentName || 'Quan lại'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#a6957e]">Tổng điểm</div>
                  <div className="font-mono-tabular text-lg font-bold text-[#6ee7b7]">
                    {score}/{totalQuestions}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#a6957e]">Thời gian</div>
                  <div className="font-mono-tabular text-lg font-bold text-[#fbd46d]">
                    {formatDuration(EXAM_DURATION_SECONDS - timeLeft)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setLeaderboardOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2c1f16] hover:bg-[#3c2a1e] text-[#fbd46d] text-sm font-semibold border border-[#b48a3e]/40 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Xem Bảng Xếp Hạng</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestartToEntry}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white text-sm font-semibold border border-[#eab308]/50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Thi lại lượt mới</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD MODAL */}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        entries={leaderboard}
        isLoading={leaderboardLoading}
        currentEntryId={lastSubmittedId}
      />
    </div>
  );
}
