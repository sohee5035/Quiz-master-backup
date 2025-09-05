import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CommentSection from "@/components/CommentSection";
import mascotImage from "@assets/Adobe Express 2025-08-21 12시 40분 8초_1755747624195.png";

interface HomeProps {
  onStart: (questionCount?: number, difficulty?: number) => void;
  onStartTimer: () => void;
  onStartDifficult: () => void;
  onStartWangsohee: () => void;
  onStartWangsoheeTimer: () => void;
}

export default function Home({ onStart, onStartTimer, onStartDifficult, onStartWangsohee, onStartWangsoheeTimer }: HomeProps) {
  return (
    <div className="container mx-auto max-w-6xl p-4">
      <Card className="mt-4 shadow-sm">
        <CardContent className="p-6">
          {/* 간소화된 헤더 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src={mascotImage} 
                alt="KB 외환 마스터 캐릭터" 
                className="w-20 h-20 rounded-full bg-orange-50 p-1"
              />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🏆 KB 외환 마스터 👑</h1>
            </div>
          </div>

          {/* 간소화된 안내 박스 */}
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-base font-semibold text-gray-900 mb-1">외환 마스터가 되는 그 날까지✨</div>
                <div className="text-sm text-gray-700">📅 예선 25.08.27 (수) 17:00 | 본선 25.09.12 (금) 16:00</div>
              </div>
              <div className="text-xs text-gray-600">
                KB 외환 마스터 시험 대비 연습 웹앱 📚 기본문제 👑 왕소희문제 ⏰ 타이머모드
                <br />💡 문의사항은 하단 댓글이나 왕소희대리에게 연락주세요!
              </div>
            </div>
          </div>

          {/* 메인 버튼 그리드 */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* 1. 기본 학습 모드 */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">📚 기본 학습 모드</h3>
                <p className="text-sm text-blue-600">기본 출제 예상 문제로 학습해보세요</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => onStart()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-session-all"
                >
                  🏃‍♀️ 전체 문제풀이 시작
                </Button>
                <Button
                  onClick={onStartTimer}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-timer-mode"
                >
                  ⚡ 타이머 모드 (10초 제한)
                </Button>
              </div>
            </div>

            {/* 2. 왕소희 제작 문제 */}
            <div className="bg-pink-50 rounded-xl border border-pink-200 p-5">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-pink-800 mb-2">👑 왕소희 제작 문제</h3>
                <p className="text-sm text-pink-600">추가로 제작한 연습 문제들</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={onStartWangsohee}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-wangsohee"
                >
                  👑 왕소희 제작 문제 풀어보기
                </Button>
                <Button
                  onClick={onStartWangsoheeTimer}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-wangsohee-timer"
                >
                  ⚡👑 왕소희 문제 타이머 모드
                </Button>
              </div>
            </div>
          </div>

          {/* 하단 버튼 그룹 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 3. 집중 공략 모드 */}
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">🎯 집중 공략 모드</h3>
                <p className="text-sm text-purple-600">약점 보완과 빠른 복습용</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={onStartDifficult}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-difficult"
                >
                  🤔 남들은 뭘 많이 틀렸을까? (TOP 20)
                </Button>
                <Button
                  onClick={() => onStart(10)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-session-random"
                >
                  🎲 랜덤 10문제 시작
                </Button>
              </div>
            </div>

            {/* 4. 난이도별 연습 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">⚡ 난이도별 연습</h3>
                <p className="text-sm text-gray-600">난이도를 선택해서 집중 학습</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => onStart(undefined, 1)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-difficulty-1"
                >
                  😊 쉬움
                </Button>
                <Button
                  onClick={() => onStart(undefined, 2)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-difficulty-2"
                >
                  😐 보통
                </Button>
                <Button
                  onClick={() => onStart(undefined, 3)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm"
                  data-testid="button-start-difficulty-3"
                >
                  😰 어려움
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 댓글 섹션 */}
      <CommentSection />
    </div>
  );
}
