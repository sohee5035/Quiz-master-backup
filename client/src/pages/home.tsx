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
    <div className="container mx-auto max-w-6xl p-3 sm:p-4">
      <Card className="mt-4 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          {/* 간소화된 헤더 */}
          <div className="text-center mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="mascot-container">
                <img 
                  src={mascotImage} 
                  alt="은행실무종합과정 마스코트" 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 dark:bg-orange-900/30 p-1"
                />
                <span className="sparkle" style={{top: '-5px', left: '-5px'}}>✨</span>
                <span className="sparkle" style={{top: '-8px', right: '-8px'}}>⭐</span>
                <span className="sparkle" style={{bottom: '-5px', left: '-3px'}}>💫</span>
                <span className="sparkle" style={{bottom: '-8px', right: '-5px'}}>✨</span>
                <span className="sparkle" style={{top: '15px', left: '-12px'}}>🌟</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">🏆 은행실무종합과정 문제풀이 👑</h1>
            </div>
          </div>

          {/* 간소화된 안내 박스 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-yellow-100 mb-2">은행실무종합과정 완벽 마스터까지✨</div>
              <div className="text-xs sm:text-sm text-gray-800 dark:text-yellow-200 space-y-1">
                <div>기본 문제와 왕소희 제작문제로 실력을 키워보세요!</div>
                <div>제작문제는 과정 범위에 맞는 문제로 구성했습니다.<br className="hidden sm:block"/><span className="sm:hidden"> </span>(업데이트 예정)</div>
                <div>🌙 맨 위 Dark 버튼을 눌러보세요</div>
                <div className="text-xs sm:text-sm font-bold">문의사항이나 의견은 하단 댓글로 남겨주세요 😊</div>
              </div>
            </div>
          </div>

          {/* 메인 버튼 그리드 */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* 1. 기본 학습 모드 */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-5">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">📚 기본 학습 모드</h3>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">기본 출제 예상 문제로 학습해보세요</p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={() => onStart()}
                  className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
                  data-testid="button-start-session-all"
                >
                  🏃‍♀️ 전체 문제풀이 시작
                </Button>
                <Button
                  onClick={onStartTimer}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
                  data-testid="button-start-timer-mode"
                >
                  ⚡ 타이머 모드 (10초 제한)
                </Button>
              </div>
            </div>

            {/* 2. 왕소희 제작 문제 */}
            <div className="bg-pink-50 dark:bg-pink-900/30 rounded-xl border border-pink-200 dark:border-pink-800 p-4 sm:p-5">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-pink-800 dark:text-pink-200 mb-2">👑 왕소희 제작 문제</h3>
                <p className="text-xs sm:text-sm text-pink-600 dark:text-pink-300">본선 대비용 문제입니다! 조금 어렵게 내봤어요. 본선까지 화이팅🤩</p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={onStartWangsohee}
                  className="w-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-700 dark:hover:bg-pink-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
                  data-testid="button-start-wangsohee"
                >
                  👑 왕소희 제작 문제 풀어보기
                </Button>
                <Button
                  onClick={onStartWangsoheeTimer}
                  className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-800 dark:hover:bg-pink-900 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
                  data-testid="button-start-wangsohee-timer"
                >
                  ⚡👑 왕소희 문제 타이머 모드 (30초)
                </Button>
              </div>
            </div>
          </div>

          {/* 하단 버튼 그룹 */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* 3. 집중 공략 모드 */}
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 p-4 sm:p-5">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">🎯 집중 공략 모드</h3>
                <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300">약점 보완과 빠른 복습용</p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={onStartDifficult}
                  className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
                  data-testid="button-start-difficult"
                >
                  🤔 남들은 뭘 많이 틀렸을까? (TOP 20)
                </Button>
                <Button
                  onClick={() => onStart(10)}
                  className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-900 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
                  data-testid="button-start-session-random"
                >
                  🎲 랜덤 10문제 시작
                </Button>
              </div>
            </div>

            {/* 4. 난이도별 연습 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-5">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">⚡ 난이도별 연습</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">난이도를 선택해서 집중 학습</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button
                  onClick={() => onStart(undefined, 1)}
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors duration-200 shadow-sm text-xs sm:text-sm"
                  data-testid="button-start-difficulty-1"
                >
                  😊 쉬움
                </Button>
                <Button
                  onClick={() => onStart(undefined, 2)}
                  className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors duration-200 shadow-sm text-xs sm:text-sm"
                  data-testid="button-start-difficulty-2"
                >
                  😐 보통
                </Button>
                <Button
                  onClick={() => onStart(undefined, 3)}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors duration-200 shadow-sm text-xs sm:text-sm"
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
