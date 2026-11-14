import { DialogueTurn, QuizQuestion } from '../types/game';

export const EMPEROR_DIALOGUE: DialogueTurn[] = [
  {
    speaker: 'Vua',
    roleLabel: 'Hoàng Đế Triều Nguyễn',
    text: 'Đất nước đang đứng trước thời cơ, vận mệnh mới, thấy được điều ấy, nay trẫm sẽ tổ chức một cuộc thi tìm người tài để giúp đất nước, mang tên 人中龍鳳 - Nhân trung long phượng.',
  },
  {
    speaker: 'Quan lại',
    roleLabel: 'Quan lại (Bạn)',
    text: 'Chúng thần sẽ tham gia như thế nào ạ?',
  },
  {
    speaker: 'Vua',
    roleLabel: 'Hoàng Đế Triều Nguyễn',
    text: 'Các ngươi sẽ phải trả lời đúng các câu hỏi trắc nghiệm.',
  },
];

export const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Lịch sử',
    question: 'Tổ chức Liên hợp quốc chính thức được thành lập vào năm nào?',
    options: [
      'Năm 1945',
      'Năm 1949',
      'Năm 1954',
      'Năm 1975',
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    category: 'Lịch sử',
    question: 'Hội nghị Ianta (tháng 2/1945) có sự tham gia của nguyên thủ ba cường quốc nào?',
    options: [
      'Anh, Pháp, Mỹ',
      'Liên Xô, Mỹ, Anh',
      'Liên Xô, Trung Quốc, Mỹ',
      'Anh, Pháp, Đức',
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    category: 'Lịch sử',
    question: 'Hiệp hội các quốc gia Đông Nam Á (ASEAN) được thành lập vào ngày 8/8/1967 tại đâu?',
    options: [
      'Hà Nội (Việt Nam)',
      'Băng Cốc (Thái Lan)',
      'Gia-các-ta (In-đô-nê-xi-a)',
      'Ma-ni-la (Phi-líp-pin)',
    ],
    correctIndex: 1,
  },
  {
    id: 4,
    category: 'Lịch sử',
    question: 'Việt Nam chính thức gia nhập tổ chức ASEAN vào năm nào?',
    options: [
      'Năm 1986',
      'Năm 1991',
      'Năm 1995',
      'Năm 2000',
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    category: 'Lịch sử',
    question: 'Chiến dịch lịch sử nào đã kết thúc thắng lợi cuộc kháng chiến chống thực dân Pháp (1945 - 1954) của nhân dân Việt Nam?',
    options: [
      'Chiến dịch Việt Bắc thu - đông 1947',
      'Chiến dịch Biên giới thu - đông 1950',
      'Chiến dịch Điện Biên Phủ năm 1954',
      'Chiến dịch Hồ Chí Minh năm 1975',
    ],
    correctIndex: 2,
  },
  {
    id: 6,
    category: 'Lịch sử',
    question: 'Chiến thắng "Điện Biên Phủ trên không" cuối năm 1972 của quân dân miền Bắc đã đánh bại cuộc tập kích bằng máy bay B-52 của nước nào?',
    options: [
      'Thực dân Pháp',
      'Đế quốc Mỹ',
      'Phát xít Nhật',
      'Quân Trung Hoa Dân quốc',
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    category: 'Lịch sử',
    question: 'Chiến dịch nào đã tạo ra cơ hội để tiến tới giải phóng hoàn toàn miền Nam?',
    options: [
      'Chiến dịch Tây Nguyên',
      'Chiến dịch Huế - Đà Nẵng',
      'Chiến dịch Hồ Chí Minh',
      'Chiến dịch Đường 9 - Nam Lào',
    ],
    correctIndex: 0,
  },
  {
    id: 8,
    category: 'Lịch sử',
    question: 'Đường lối Đổi mới đất nước ở Việt Nam được Đảng Cộng sản Việt Nam đề ra tại Đại hội đại biểu toàn quốc lần thứ mấy (năm 1986)?',
    options: [
      'Đại hội lần thứ IV',
      'Đại hội lần thứ V',
      'Đại hội lần thứ VI',
      'Đại hội lần thứ VII',
    ],
    correctIndex: 2,
  },
  {
    id: 9,
    category: 'Lịch sử',
    question: 'Biểu tượng của sự đối đầu gay gắt giữa hai phe Tư bản chủ nghĩa và Xã hội chủ nghĩa ở châu Âu trong thời kỳ Chiến tranh lạnh là công trình nào?',
    options: [
      'Bức tường Béc-lin',
      'Tháp Ép-phen',
      'Đấu trường Cô-li-dê',
      'Khải Hoàn Môn',
    ],
    correctIndex: 0,
  },
  {
    id: 10,
    category: 'Lịch sử',
    question: 'Nguyên tắc hoạt động cơ bản của Liên hợp quốc là giải quyết các tranh chấp quốc tế bằng biện pháp gì?',
    options: [
      'Sử dụng vũ lực quân sự',
      'Cấm vận kinh tế',
      'Biện pháp hòa bình',
      'Đấu tranh vũ trang',
    ],
    correctIndex: 2,
  },
  {
    id: 11,
    category: 'Văn hóa',
    question: 'Loại hình nghệ thuật sân khấu truyền thống nào của Việt Nam sử dụng mặt nước làm sân khấu biểu diễn?',
    options: [
      'Múa rối nước',
      'Hát chèo',
      'Cải lương',
      'Hát bội (Tuồng)',
    ],
    correctIndex: 0,
  },
  {
    id: 12,
    category: 'Văn hóa',
    question: 'Trang phục truyền thống tiêu biểu và được xem là biểu tượng của người phụ nữ Việt Nam là gì?',
    options: [
      'Áo bà ba',
      'Áo dài',
      'Áo tứ thân',
      'Áo yếm',
    ],
    correctIndex: 1,
  },
  {
    id: 13,
    category: 'Văn hóa',
    question: 'Lễ hội Giỗ Tổ Hùng Vương được tổ chức vào ngày mùng 10 tháng 3 Âm lịch hằng năm diễn ra tại tỉnh nào?',
    options: [
      'Bắc Ninh',
      'Phú Thọ',
      'Ninh Bình',
      'Thanh Hóa',
    ],
    correctIndex: 1,
  },
  {
    id: 14,
    category: 'Văn hóa',
    question: 'Loại hình dân ca trữ tình nổi tiếng của vùng Kinh Bắc (Bắc Ninh - Bắc Giang) đã được UNESCO công nhận là Di sản văn hóa phi vật thể là gì?',
    options: [
      'Dân ca Quan họ',
      'Ca trù',
      'Hát Xoan',
      'Đờn ca tài tử',
    ],
    correctIndex: 0,
  },
  {
    id: 15,
    category: 'Văn hóa',
    question: 'Trong mâm cỗ ngày Tết cổ truyền của người miền Bắc, loại bánh truyền thống hình vuông được gói bằng lá dong là bánh gì?',
    options: [
      'Bánh tét',
      'Bánh chưng',
      'Bánh ít',
      'Bánh giầy',
    ],
    correctIndex: 1,
  },
  {
    id: 16,
    category: 'Văn hóa',
    question: 'Không gian văn hóa Cồng chiêng là nét đặc trưng nổi tiếng của đồng bào các dân tộc thiểu số ở khu vực nào nước ta?',
    options: [
      'Đồng bằng sông Hồng',
      'Đồng bằng sông Cửu Long',
      'Tây Nguyên',
      'Duyên hải miền Trung',
    ],
    correctIndex: 2,
  },
  {
    id: 17,
    category: 'Văn hóa',
    question: 'Ngôi trường đại học đầu tiên của Việt Nam được xây dựng vào năm 1076 tại kinh thành Thăng Long có tên là gì?',
    options: [
      'Quốc Tử Giám',
      'Văn Miếu',
      'Viện Hàn Lâm',
      'Quốc Sử Quán',
    ],
    correctIndex: 0,
  },
  {
    id: 18,
    category: 'Văn hóa',
    question: 'Nhạc cụ dân tộc truyền thống của Việt Nam chỉ có duy nhất một dây nhưng có thể tạo ra nhiều âm thanh trầm bổng khác nhau là gì?',
    options: [
      'Đàn tranh',
      'Đàn bầu (Độc huyền cầm)',
      'Đàn nguyệt',
      'Đàn tỳ bà',
    ],
    correctIndex: 1,
  },
  {
    id: 19,
    category: 'Văn hóa',
    question: 'Tranh dân gian Đông Hồ nổi tiếng với màu sắc tự nhiên và giấy điệp có nguồn gốc từ tỉnh nào?',
    options: [
      'Hà Nội',
      'Bắc Ninh',
      'Hải Dương',
      'Nam Định',
    ],
    correctIndex: 1,
  },
  {
    id: 20,
    category: 'Văn hóa',
    question: 'Vịnh Hạ Long (Quảng Ninh) nổi tiếng với hàng nghìn hòn đảo đá vôi kỳ vĩ đã được UNESCO công nhận là gì?',
    options: [
      'Di sản Thiên nhiên Thế giới',
      'Công viên Địa chất Toàn cầu',
      'Khu Dự trữ Sinh quyển Thế giới',
      'Di sản Tư liệu Thế giới',
    ],
    correctIndex: 0,
  },
];

export function getImperialRank(score: number, total: number): string {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.95) return 'Trạng Nguyên';
  if (ratio >= 0.85) return 'Bảng Nhãn';
  if (ratio >= 0.75) return 'Thám Hoa';
  if (ratio >= 0.6) return 'Tiến Sĩ';
  if (ratio >= 0.45) return 'Cử Nhân';
  return 'Tú Tài';
}

export function parseQuestionsFromFile(content: string, fileName: string): QuizQuestion[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  // 1. JSON format
  if (fileName.toLowerCase().endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.questions) ? parsed.questions : [];
      const mapped: QuizQuestion[] = [];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item && typeof item.question === 'string' && Array.isArray(item.options) && item.options.length >= 4) {
          let correctIdx = 0;
          if (typeof item.correctIndex === 'number') {
            correctIdx = Math.max(0, Math.min(3, item.correctIndex));
          } else if (typeof item.answer === 'string') {
            const letter = item.answer.trim().toUpperCase();
            const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
            correctIdx = map[letter] ?? 0;
          }
          mapped.push({
            id: i + 1,
            category: typeof item.category === 'string' ? item.category : undefined,
            question: item.question.trim(),
            options: [
              String(item.options[0]),
              String(item.options[1]),
              String(item.options[2]),
              String(item.options[3]),
            ],
            correctIndex: correctIdx,
            explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
          });
        }
      }
      if (mapped.length > 0) return mapped.slice(0, 20);
    } catch {
      // fall through to text parser
    }
  }

  // 2. CSV format (question,A,B,C,D,correctLetterOrIndex)
  if (fileName.toLowerCase().endsWith('.csv')) {
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsedCsv: QuizQuestion[] = [];
    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (i === 0 && /question|câu/i.test(cols[0])) continue;
      if (cols.length >= 6) {
        const ans = cols[5].toUpperCase();
        const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, '0': 0, '1': 1, '2': 2, '3': 3 };
        parsedCsv.push({
          id: parsedCsv.length + 1,
          question: cols[0],
          options: [cols[1], cols[2], cols[3], cols[4]],
          correctIndex: map[ans] ?? 0,
        });
      }
    }
    if (parsedCsv.length > 0) return parsedCsv.slice(0, 20);
  }

  // 3. TXT plain-text quiz format:
  // Câu 1: ...
  // A. ...
  // B. ...
  // C. ...
  // D. ...
  // Đáp án đúng: A  (or Đáp án: A)
  const blocks = trimmed.split(/(?=^(?:Câu|Question)\s*\d+\s*[:.])/im).filter((b) => b.trim());
  const parsedTxt: QuizQuestion[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 5) continue;
    const qLine = lines[0].replace(/^(?:Câu|Question)\s*\d+\s*[:.]\s*/i, '').trim();
    const opts: string[] = ['', '', '', ''];
    let correctIdx = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const optMatch = line.match(/^([A-D])[.)]\s*(.+)$/i);
      if (optMatch) {
        const idx = optMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < 4) opts[idx] = optMatch[2].trim();
        continue;
      }
      const ansMatch = line.match(/^(?:Đáp án đúng|Đáp án|Answer|ĐA)\s*[:.]\s*([A-D])/i);
      if (ansMatch) {
        correctIdx = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
      }
    }
    if (qLine && opts.every((o) => o.length > 0)) {
      parsedTxt.push({
        id: parsedTxt.length + 1,
        question: qLine,
        options: [opts[0], opts[1], opts[2], opts[3]],
        correctIndex: Math.max(0, Math.min(3, correctIdx)),
      });
    }
  }

  return parsedTxt.slice(0, 20);
}
