// 샘플 연습문제 (DB 미연결 시 메모리 저장소 기본 데이터로 사용)
// 원본: sample_questions.csv

export interface SampleQuestion {
  id: string;
  type: "MCQ" | "OX";
  stem: string;
  explanation: string;
  tags: string;
  subject: string;
  difficulty: number;
  answer?: boolean; // OX 정답
  choices?: string[]; // MCQ 선택지
  correct?: number; // MCQ 정답 번호 (1부터)
}

export const sampleQuestions: SampleQuestion[] = [
  {
    id: "sample_01",
    type: "MCQ",
    stem: "2025년 9월 1일부터 적용되는 예금자보호법상 1인당(금융회사별) 예금 보호한도는?",
    explanation: "예금자보호 한도는 2025년 9월 1일부터 원금과 소정의 이자를 합쳐 1인당 금융회사별 1억원으로 올랐습니다. (이전: 5천만원)",
    tags: "예금자보호",
    subject: "수신",
    difficulty: 1,
    choices: ["3천만원", "5천만원", "1억원", "2억원"],
    correct: 3,
  },
  {
    id: "sample_02",
    type: "OX",
    stem: "양도성예금증서(CD)는 예금자보호법에 따른 보호 대상이다.",
    explanation: "양도성예금증서(CD)는 예금자보호 대상이 아닙니다. 보통예금, 정기예금, 적금 등이 보호 대상입니다.",
    tags: "예금자보호",
    subject: "수신",
    difficulty: 2,
    answer: false,
  },
  {
    id: "sample_03",
    type: "OX",
    stem: "금융소득종합과세는 연간 이자·배당소득 합계액이 2천만원을 초과하는 경우에 적용된다.",
    explanation: "연간 금융소득(이자+배당)이 2천만원을 넘으면, 넘는 부분은 다른 종합소득과 합산해 누진세율로 과세됩니다.",
    tags: "금융소득종합과세",
    subject: "수신",
    difficulty: 2,
    answer: true,
  },
  {
    id: "sample_04",
    type: "MCQ",
    stem: "다음 중 DSR의 의미로 옳은 것은?",
    explanation: "DSR(Debt Service Ratio)은 총부채원리금상환비율로, 연소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. DTI는 총부채상환비율, LTV는 주택담보대출비율입니다.",
    tags: "대출규제",
    subject: "개인여신",
    difficulty: 1,
    choices: ["총부채상환비율", "총부채원리금상환비율", "주택담보대출비율", "예대율"],
    correct: 2,
  },
  {
    id: "sample_05",
    type: "OX",
    stem: "LTV(주택담보대출비율)는 담보로 잡는 주택의 가격 대비 대출금액의 비율을 뜻한다.",
    explanation: "LTV(Loan To Value)는 주택 담보가치 대비 대출금액의 비율입니다.",
    tags: "대출규제",
    subject: "개인여신",
    difficulty: 1,
    answer: true,
  },
  {
    id: "sample_06",
    type: "MCQ",
    stem: "다음 중 기업의 단기 지급능력(유동성)을 판단하는 데 가장 적합한 재무비율은?",
    explanation: "유동비율(유동자산 ÷ 유동부채 × 100)은 1년 안에 갚아야 할 부채를 1년 안에 현금화할 수 있는 자산으로 얼마나 감당할 수 있는지 보여주는 대표적인 유동성 지표입니다.",
    tags: "재무분석",
    subject: "기업여신",
    difficulty: 2,
    choices: ["유동비율", "부채비율", "매출액영업이익률", "총자산회전율"],
    correct: 1,
  },
  {
    id: "sample_07",
    type: "OX",
    stem: "부채비율(부채총계 ÷ 자기자본 × 100)은 일반적으로 낮을수록 재무구조가 안정적인 것으로 본다.",
    explanation: "부채비율이 낮을수록 타인자본 의존도가 낮아 재무안정성이 높은 것으로 평가합니다.",
    tags: "재무분석",
    subject: "기업여신",
    difficulty: 1,
    answer: true,
  },
  {
    id: "sample_08",
    type: "OX",
    stem: "은행에서 판매한 펀드(집합투자증권)는 예금자보호법에 따라 보호된다.",
    explanation: "펀드는 실적배당 상품으로 원금 손실이 발생할 수 있으며, 은행에서 판매했더라도 예금자보호 대상이 아닙니다.",
    tags: "펀드 기초",
    subject: "집합투자",
    difficulty: 1,
    answer: false,
  },
  {
    id: "sample_09",
    type: "MCQ",
    stem: "다음 중 거래소에 상장되어 주식처럼 실시간으로 사고팔 수 있는 펀드는?",
    explanation: "ETF(상장지수펀드)는 특정 지수를 따라가도록 운용되며 거래소에 상장되어 주식처럼 매매할 수 있습니다.",
    tags: "펀드 종류",
    subject: "집합투자",
    difficulty: 1,
    choices: ["ETF", "ELS", "MMF", "사모펀드"],
    correct: 1,
  },
  {
    id: "sample_10",
    type: "OX",
    stem: "신용카드 단기카드대출(현금서비스)은 이용한 날부터 이자(수수료)가 붙는다.",
    explanation: "현금서비스는 이용일부터 결제일까지의 기간에 대해 수수료가 붙습니다. 일시불 물품 결제처럼 무이자 기간이 없습니다.",
    tags: "카드대출",
    subject: "신용카드",
    difficulty: 2,
    answer: true,
  },
  {
    id: "sample_11",
    type: "MCQ",
    stem: "고객이 해외로 돈을 보내는 당발송금을 할 때 적용하는 환율은?",
    explanation: "당발송금은 은행이 고객에게 외화를 파는 거래이므로 전신환 매도율을 적용합니다. 반대로 타발송금(해외에서 들어온 돈)은 전신환 매입율을 적용합니다.",
    tags: "환율의 구조",
    subject: "외환",
    difficulty: 1,
    choices: ["전신환 매입율", "전신환 매도율", "현찰 매입율", "현찰 매도율"],
    correct: 2,
  },
  {
    id: "sample_12",
    type: "OX",
    stem: "고객에게 외국통화(현찰)를 팔 때는 현찰 매도율을 적용한다.",
    explanation: "은행이 고객에게 외화 현찰을 파는 거래이므로 현찰 매도율을 적용합니다.",
    tags: "환율의 구조",
    subject: "외환",
    difficulty: 1,
    answer: true,
  },
];
