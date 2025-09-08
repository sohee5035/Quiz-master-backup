import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WangsoheeSetupProps {
  onStart: (questionCount: number) => void;
  onBack: () => void;
}

export default function WangsoheeSetup({ onStart, onBack }: WangsoheeSetupProps) {
  const questionOptions = [
    { count: 10, label: "10문제", description: "빠른 연습", color: "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800" },
    { count: 30, label: "30문제", description: "적당한 분량", color: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800" },
    { count: 50, label: "50문제", description: "충분한 연습", color: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800" },
  ];

  return (
    <div className="container mx-auto max-w-2xl p-3 sm:p-6">
      <Card className="mt-4 sm:mt-8 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">👑 왕소희 제작 문제 👑</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">조금 어렵게 내봤습니다. 화이팅❤️‍🔥</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">문제 개수를 선택해서 연습하세요</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {questionOptions.map((option) => (
              <Button
                key={option.count}
                onClick={() => onStart(option.count)}
                className={`w-full ${option.color} text-white font-semibold py-4 sm:py-6 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base`}
                data-testid={`button-wangsohee-${option.count}`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-bold">{option.label}</div>
                    <div className="text-xs sm:text-sm opacity-90">{option.description}</div>
                  </div>
                  <div className="text-xl sm:text-2xl">👑</div>
                </div>
              </Button>
            ))}
            
            {/* 전체 문제 버튼 */}
            <Button
              onClick={() => onStart(0)} // 0은 전체 문제를 의미
              className="w-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-700 dark:hover:bg-pink-800 text-white font-semibold py-4 sm:py-6 px-4 sm:px-6 rounded-xl transition-colors duration-200 shadow-sm text-sm sm:text-base"
              data-testid="button-wangsohee-all"
            >
              <div className="flex justify-between items-center w-full">
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold">전체 문제</div>
                  <div className="text-xs sm:text-sm opacity-90">모든 왕소희 문제</div>
                </div>
                <div className="text-xl sm:text-2xl">👑✨</div>
              </div>
            </Button>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-800 p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-2 text-sm sm:text-base">👑 왕소희 제작 문제 특징</h3>
            <ul className="text-xs sm:text-sm text-pink-700 dark:text-pink-200 space-y-1">
              <li>• 왕소희님이 직접 만든 문제들만 출제</li>
              <li>• 기본 문제보다 조금 더 어려운 난이도</li>
              <li>• 실제 시험에서 나올 수 있는 응용 문제</li>
              <li>• 해설을 충분히 읽고 이해하며 학습</li>
              <li>• 틀린 문제는 꼭 다시 한번 복습하세요</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
              data-testid="button-back-home-wangsohee-setup"
            >
              🏠 홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}