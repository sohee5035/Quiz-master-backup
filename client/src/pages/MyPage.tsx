import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { clearStoredEmployee } from "@/lib/auth";
import type { LoginResponse, SessionHistoryItem } from "@shared/schema";

interface MyPageProps {
  employee: LoginResponse;
  onLogout: () => void;
  onBack: () => void;
  onStartWrong: () => void;
  onStartBookmarked: () => void;
}

const MODE_LABELS: Record<string, string> = {
  study: "기본 학습",
  timer: "타이머 모드",
  difficult: "집중 공략 (TOP 20)",
  wangsohee: "왕소희 제작 문제",
  "wangsohee-timer": "왕소희 타이머",
  wrong: "틀린 문제 다시 풀기",
  bookmarked: "북마크 문제",
};

export default function MyPage({ employee, onLogout, onBack, onStartWrong, onStartBookmarked }: MyPageProps) {
  const [sessions, setSessions] = useState<SessionHistoryItem[] | null>(null);
  const [wrongCount, setWrongCount] = useState<number | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);

  useEffect(() => {
    api.getMySessions(employee.employeeId).then(setSessions).catch(() => setSessions([]));
    api.getWrongQuestionCount(employee.employeeId).then(setWrongCount).catch(() => setWrongCount(0));
    api.getBookmarkedQuestions(employee.employeeId).then(q => setBookmarkCount(q.length)).catch(() => setBookmarkCount(0));
  }, [employee.employeeId]);

  const handleLogout = () => {
    clearStoredEmployee();
    onLogout();
  };

  return (
    <div className="container mx-auto max-w-3xl p-3 sm:p-4">
      <Card className="mt-4 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">👤 {employee.name}님 마이페이지</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">직원번호 {employee.employeeId}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              로그아웃
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎯 틀린 문제 다시 풀기</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-3">
                {wrongCount === null ? "불러오는 중..." : `현재 틀리고 있는 문제 ${wrongCount}개`}
              </p>
              <Button
                onClick={onStartWrong}
                disabled={!wrongCount}
                className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800 text-white disabled:opacity-50"
                data-testid="button-start-wrong"
              >
                다시 풀기
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔖 북마크한 문제</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                {bookmarkCount === null ? "불러오는 중..." : `북마크한 문제 ${bookmarkCount}개`}
              </p>
              <Button
                onClick={onStartBookmarked}
                disabled={!bookmarkCount}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white disabled:opacity-50"
                data-testid="button-start-bookmarked"
              >
                북마크 문제 풀기
              </Button>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">📋 최근 응시 이력</h2>
          {sessions === null ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">아직 응시한 세션이 없어요.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40"
                  data-testid={`row-session-${session.sessionId}`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {MODE_LABELS[session.mode] || session.mode}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.startedAt ? new Date(session.startedAt).toLocaleString("ko-KR") : ""}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session.correctAnswers} / {session.totalQuestions} 정답
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full mt-6" onClick={onBack} data-testid="button-mypage-back">
            홈으로
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
