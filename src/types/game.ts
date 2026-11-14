export interface QuizQuestion {
  id: number;
  category?: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0 = A, 1 = B, 2 = C, 3 = D
  explanation?: string;
}

export type GamePhase =
  | 'entry'        // Nhập tên học sinh, chọn/tải câu hỏi, xem bảng xếp hạng
  | 'dialogue'     // Màn hình 1: Đối thoại với Vua trong điện
  | 'ngo_mon'      // Màn hình 2: Trước cổng Ngọ Môn với nút Bắt đầu
  | 'entering'     // Cổng Ngọ Môn mở ra, người chơi bước vào Kinh thành Huế
  | 'walking'      // Góc nhìn thứ nhất bước tiến 5 bước trong Kinh thành Huế
  | 'question'     // Hiện câu hỏi trắc nghiệm (1 -> 20)
  | 'entering_hall'// Hoàn thành câu 20, cửa Điện Thái Hòa mở, bước vào & chuyển góc nhìn thứ ba
  | 'reward';      // Màn hình kết thúc: Góc nhìn thứ ba bao quát Điện Thái Hòa + Vua khen thưởng + BXH

export interface DialogueTurn {
  speaker: 'Vua' | 'Quan lại';
  roleLabel: string;
  text: string;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  rankTitle: string;
  completedAt: string;
}
