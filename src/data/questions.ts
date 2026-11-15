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
    category: 'Tin học',
    question: 'Ứng dụng nào sau đây là một ví dụ điển hình của Trí tuệ nhân tạo (AI)?',
    options: [
      'Phần mềm soạn thảo văn bản cơ bản',
      'Trợ lý ảo nhận diện giọng nói trên điện thoại',
      'Máy tính bỏ túi cầm tay',
      'Ứng dụng đồng hồ báo thức thông thường',
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    category: 'Tin học',
    question: 'Thiết bị nào có chức năng chuyển đổi tín hiệu số thành tín hiệu tương tự và ngược lại để kết nối mạng với nhà cung cấp dịch vụ Internet (ISP)?',
    options: [
      'Switch',
      'Hub',
      'Modem',
      'Access Point',
    ],
    correctIndex: 2,
  },
  {
    id: 3,
    category: 'Tin học',
    question: 'Thiết bị nào dùng để cung cấp kết nối mạng không dây (Wi-Fi) cho các thiết bị trong một khu vực nhất định?',
    options: [
      'Access Point (Điểm truy cập không dây)',
      'Cáp quang',
      'Máy quét (Scanner)',
      'Ổ cứng di động',
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    category: 'Tin học',
    question: 'Giao thức mạng nào chịu trách nhiệm định địa chỉ và định tuyến các gói tin đi đúng đường trên Internet?',
    options: [
      'HTTP',
      'IP',
      'FTP',
      'POP3',
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    category: 'Tin học',
    question: 'Khi chia sẻ tài nguyên (như máy in hoặc thư mục) trên mạng cục bộ (LAN) trong Windows, ta cần đảm bảo điều kiện nào đầu tiên?',
    options: [
      'Các máy tính phải cùng hãng sản xuất',
      'Các máy tính phải kết nối chung một mạng cục bộ',
      'Tất cả máy tính đều phải có màn hình cảm ứng',
      'Máy tính phải cài đặt phần mềm diệt virus trả phí',
    ],
    correctIndex: 1,
  },
  {
    id: 6,
    category: 'Tin học',
    question: 'Hành động nào sau đây giúp giữ gìn tính nhân văn khi giao tiếp trên không gian mạng?',
    options: [
      'Chế giễu ngoại hình của người khác trên mạng xã hội',
      'Tung tin đồn chưa được kiểm chứng để gây chú ý',
      'Tôn trọng sự khác biệt và cảm thông với người khác',
      'Chia sẻ video bạo lực học đường lên hội nhóm',
    ],
    correctIndex: 2,
  },
  {
    id: 7,
    category: 'Tin học',
    question: 'Trong cấu trúc cơ bản của một tài liệu HTML, phần nội dung chính hiển thị trên trình duyệt web được đặt bên trong cặp thẻ nào?',
    options: [
      '<head> và </head>',
      '<title> và </title>',
      '<body> và </body>',
      '<meta> và </meta>',
    ],
    correctIndex: 2,
  },
  {
    id: 8,
    category: 'Tin học',
    question: 'Trong HTML, cặp thẻ nào dùng để định dạng chữ in đậm và nhấn mạnh tầm quan trọng của văn bản?',
    options: [
      '<em>...</em>',
      '<strong>...</strong>',
      '<u>...</u>',
      '<mark>...</mark>',
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    category: 'Tin học',
    question: 'Trong HTML, thẻ nào được sử dụng để tạo siêu liên kết (hyperlink) dẫn tới một trang web khác?',
    options: [
      '<img>',
      '<a>',
      '<link>',
      '<p>',
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    category: 'Tin học',
    question: 'Trong HTML, cặp thẻ nào được sử dụng để tạo một bảng (table)?',
    options: [
      '<tr>...</tr>',
      '<td>...</td>',
      '<table>...</table>',
      '<th>...</th>',
    ],
    correctIndex: 2,
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
