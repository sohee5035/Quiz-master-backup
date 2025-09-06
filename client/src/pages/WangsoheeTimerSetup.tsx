import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WangsoheeTimerSetupProps {
  onStart: (questionCount: number) => void;
  onBack: () => void;
}

export default function WangsoheeTimerSetup({ onStart, onBack }: WangsoheeTimerSetupProps) {
  const questionOptions = [
    { count: 10, label: "10문제", description: "빠른 연습", color: "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800" },
    { count: 30, label: "30문제", description: "적당한 분량", color: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800" },
    { count: 50, label: "50문제", description: "충분한 연습", color: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800" },
  ];

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card className="mt-8 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">👑⚡ 왕소희 타이머 모드 설정 ⚡👑</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">왕소희님이 만든 문제를 몇 개 풀어볼까요?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">각 문제마다 10초의 제한 시간이 있습니다</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-4 mb-8">
            {questionOptions.map((option) => (
              <Button
                key={option.count}
                onClick={() => onStart(option.count)}
                className={`w-full ${option.color} text-white font-semibold py-6 px-6 rounded-xl transition-colors duration-200 shadow-sm`}
                data-testid={`button-wangsohee-timer-${option.count}`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <div className="text-lg font-bold">{option.label}</div>
                    <div className="text-sm opacity-90">{option.description}</div>
                  </div>
                  <div className="text-2xl">👑⚡</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-800 p-4 mb-6">
            <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-2">👑 왕소희 타이머 모드 규칙</h3>
            <ul className="text-sm text-pink-700 dark:text-pink-200 space-y-1">
              <li>• 왕소희님이 직접 만든 문제들만 출제</li>
              <li>• 각 문제마다 10초의 제한 시간</li>
              <li>• 답을 선택하면 즉시 제출</li>
              <li>• 시간 초과 시 자동으로 다음 문제</li>
              <li>• 해설을 5초간 보여준 후 자동 진행</li>
              <li>• 마지막에 틀린 문제만 모아서 복습</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-8 py-3"
              data-testid="button-back-home-wangsohee"
            >
              🏠 홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}