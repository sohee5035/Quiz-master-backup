import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Calendar, BarChart3, Trash2, Globe, MessageSquare, Edit } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 조회수 통계 컴포넌트
function StatsCard() {
  const { data: stats, isLoading } = useQuery<{
    todayViews: number; 
    totalViews: number;
    todayUniqueVisitors: number;
    totalUniqueVisitors: number;
  }>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            웹사이트 조회수
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-yellow-500" />
            조회수 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { 
    todayViews = 0, 
    totalViews = 0, 
    todayUniqueVisitors = 0, 
    totalUniqueVisitors = 0 
  } = stats || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          웹사이트 조회수
        </CardTitle>
        <CardDescription>실시간 방문자 통계</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">오늘</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-today-views">
              {todayViews.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">조회수 ({todayUniqueVisitors}명 방문)</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">총합</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-total-views">
              {totalViews.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">누적 조회수 ({totalUniqueVisitors}명 방문)</p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          * 30초마다 자동 업데이트됩니다
        </div>
      </CardContent>
    </Card>
  );
}

// 일별 방문 통계 차트 컴포넌트
function DailyVisitChart() {
  const { data: dailyStats, isLoading } = useQuery<{
    date: string;
    visitors: number;
    pageViews: number;
  }[]>({
    queryKey: ['/api/admin/daily-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/daily-stats?days=5');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000, // 1분마다 자동 새로고침
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            일별 방문 통계 (최근 5일)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-purple-500" />
            통계 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            일별 방문 통계 (최근 5일)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>아직 방문 데이터가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 데이터를 날짜 포맷팅 및 숫자 변환
  const chartData = dailyStats.map(stat => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    visitors: Number(stat.visitors),
    pageViews: Number(stat.pageViews)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          일별 방문 통계 (최근 5일)
        </CardTitle>
        <CardDescription>일별 방문자 수와 페이지뷰 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                name="방문자 수"
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                name="페이지뷰"
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// 모드별 사용 통계 컴포넌트
function ModeStatsCard() {
  const { data: modeStats, isLoading: isModeStatsLoading } = useQuery<{
    mode: string;
    count: number;
  }[]>({
    queryKey: ['/api/admin/mode-stats'],
    refetchInterval: 60000, // 1분마다 자동 새로고침
  });

  if (isModeStatsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            모드별 사용 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-blue-500" />
            모드 통계 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!modeStats || modeStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            모드별 사용 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            아직 사용 데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getModeDisplayName = (mode: string) => {
    switch (mode) {
      case 'study': return '📚 일반 학습';
      case 'timer': return '⏱️ 타이머 모드';
      case 'difficult': return '🤔 어려운 문제';
      case 'mock': return '🎯 모의시험';
      case 'review': return '📝 복습 모드';
      default: return `❓ ${mode}`;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'study': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'timer': return 'bg-red-50 text-red-700 border-red-200';
      case 'difficult': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'mock': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'review': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalSessions = modeStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          모드별 사용 통계
        </CardTitle>
        <CardDescription>어떤 학습 모드가 인기인지 확인해보세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {modeStats.map((stat, index) => {
          const percentage = ((stat.count / totalSessions) * 100).toFixed(1);
          return (
            <div key={stat.mode} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getModeColor(stat.mode)}`}>
                    {index + 1}위
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{getModeDisplayName(stat.mode)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stat.count}회</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t dark:border-gray-700">
          * 1분마다 자동 업데이트됩니다 | 총 세션 수: {totalSessions}개
        </div>
      </CardContent>
    </Card>
  );
}

// 문제별 정답률 통계 컴포넌트
function QuestionStatsCard() {
  const { data: questionStats, isLoading: isQuestionStatsLoading } = useQuery<{
    questionId: string;
    questionStem: string;
    type: string;
    difficulty: number | null;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
  }[]>({
    queryKey: ['/api/admin/question-stats'],
    refetchInterval: 60000, // 1분마다 자동 새로고침
  });

  if (isQuestionStatsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            문제별 정답률 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-purple-500" />
            문제 통계 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questionStats || questionStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            문제별 정답률 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            아직 통계 데이터가 없습니다. 사람들이 문제를 풀면 여기에 표시됩니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 bg-green-50";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getDifficultyText = (difficulty: number | null) => {
    if (difficulty === 1) return "쉬움";
    if (difficulty === 2) return "보통";
    if (difficulty === 3) return "어려움";
    return "미설정";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          문제별 정답률 통계
        </CardTitle>
        <CardDescription>
          정답률 낮은 순으로 정렬 • 총 {questionStats.length}문제
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questionStats.map((stat) => (
            <div key={stat.questionId} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-500">{stat.questionId}</span>
                  <span className={`px-2 py-1 rounded text-xs ${stat.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {stat.type === 'MCQ' ? '사지선다' : 'OX'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    {getDifficultyText(stat.difficulty)}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getAccuracyColor(stat.accuracy)}`}>
                  {stat.accuracy.toFixed(1)}%
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                {stat.questionStem}
              </div>
              <div className="text-xs text-gray-500 flex gap-4">
                <span>응답수: {stat.totalAttempts}</span>
                <span>정답: {stat.correctAttempts}</span>
                <span>오답: {stat.totalAttempts - stat.correctAttempts}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          * 1분마다 자동 업데이트됩니다
        </div>
      </CardContent>
    </Card>
  );
}

// 관리자 로그인 컴포넌트
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 비밀번호 확인 (1122)
    setTimeout(() => {
      if (password === "1122") {
        toast({
          title: "로그인 성공",
          description: "관리자 페이지에 접근할 수 있습니다.",
        });
        onLogin();
      } else {
        toast({
          title: "로그인 실패",
          description: "올바른 비밀번호를 입력해주세요.",
          variant: "destructive",
        });
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🔐 관리자 로그인</CardTitle>
          <CardDescription>관리자 페이지에 접근하려면 비밀번호를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-password">비밀번호</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                data-testid="input-admin-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-admin-login"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// IP별 방문자 통계 컴포넌트
function VisitorStatsCard() {
  const { data: visitorStats, isLoading } = useQuery<{
    visitors: {ipAddress: string; visitCount: number; lastVisitAt: string}[];
    totalIPs: number;
    message: string;
  }>({
    queryKey: ['/api/admin/visitor-stats'],
    refetchInterval: 60000, // 1분마다 새로고침
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            IP별 방문자 통계
          </CardTitle>
          <CardDescription>각 IP 주소별 재방문 횟수 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-purple-500" />
            방문자 통계 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { visitors = [], totalIPs = 0 } = visitorStats || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          IP별 방문자 통계
        </CardTitle>
        <CardDescription>각 IP 주소별 재방문 횟수 분석 (총 {totalIPs}개 IP)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {visitors.length > 0 ? (
            visitors.map((visitor, index) => {
              const isFrequentVisitor = visitor.visitCount >= 10;
              const isNewVisitor = visitor.visitCount === 1;
              
              return (
                <div 
                  key={visitor.ipAddress} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {visitor.ipAddress}
                      </span>
                      {isFrequentVisitor && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          단골방문자
                        </Badge>
                      )}
                      {isNewVisitor && (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          신규방문자
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      마지막 방문: {new Date(visitor.lastVisitAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {visitor.visitCount.toLocaleString()}회
                    </div>
                    <div className="text-xs text-gray-500">
                      #{index + 1}위
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 방문자 데이터가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 댓글 관리 컴포넌트
function CommentManagementCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: commentsData, isLoading } = useQuery<{
    success: boolean;
    comments: any[];
    total: number;
  }>({
    queryKey: ['/api/comments'],
    refetchInterval: 30000, // 30초마다 새로고침
  });

  // 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/comments/${commentId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "삭제 완료",
        description: "댓글이 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
    },
    onError: (error: any) => {
      toast({
        title: "삭제 실패",
        description: error.message || "댓글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            댓글 관리
          </CardTitle>
          <CardDescription>사용자들이 남긴 댓글을 IP와 함께 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-green-500" />
            댓글 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { comments = [], total = 0 } = commentsData || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          댓글 관리
        </CardTitle>
        <CardDescription>사용자들이 남긴 댓글을 IP와 함께 확인할 수 있습니다. (총 {total}개)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length > 0 ? (
            comments.map((comment: any, index: number) => (
              <div
                key={comment.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        #{index + 1}
                      </Badge>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        IP: {comment.ipAddress}
                      </span>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt 
                          ? new Date(comment.createdAt).toLocaleString('ko-KR')
                          : '방금 전'
                        }
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                    {comment.userAgent && (
                      <div className="text-xs text-gray-500 truncate">
                        브라우저: {comment.userAgent}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => {
                        if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
                          deleteCommentMutation.mutate(comment.id);
                        }
                      }}
                      disabled={deleteCommentMutation.isPending}
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 등록된 댓글이 없습니다.
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t">
          * 30초마다 자동 업데이트됩니다
        </div>
      </CardContent>
    </Card>
  );
}

// 문제 관리 컴포넌트
function ManageQuestionsCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 편집 상태 관리
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    stem: "",
    explanation: "",
    tags: "",
    difficulty: "",
    source: "",
    answer: null as boolean | null,
    choices: [
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false }
    ]
  });

  // 모든 문제 조회
  const { data: questions, isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/questions'],
    refetchInterval: 30000, // 30초마다 새로고침
  });

  // 문제 수정 mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, questionData, choices }: { questionId: string; questionData: any; choices?: any[] }) => {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionData,
          choices: choices
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "수정 완료",
        description: data.message || "문제가 수정되었습니다.",
      });
      // 캐시 무효화하여 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      setIsEditModalOpen(false);
      setEditingQuestion(null);
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "문제 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // 문제 삭제 mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "삭제 완료",
        description: data.message || "문제가 삭제되었습니다.",
      });
      // 캐시 무효화하여 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "문제 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuestion = (questionId: string, questionStem: string) => {
    if (window.confirm(`정말로 이 문제를 삭제하시겠습니까?\n\n"${questionStem.substring(0, 50)}${questionStem.length > 50 ? '...' : ''}"\n\n이 작업은 되돌릴 수 없습니다!`)) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleEditQuestion = async (question: any) => {
    setEditingQuestion(question);
    
    // 편집 폼에 기존 데이터 로드
    setEditForm({
      stem: question.stem,
      explanation: question.explanation || "",
      tags: question.tags || "",
      difficulty: question.difficulty?.toString() || "",
      source: question.source || "",
      answer: question.answer,
      choices: [
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
        { content: "", isCorrect: false }
      ]
    });

    // MCQ 문제의 경우 선택지 로드
    if (question.type === "MCQ") {
      try {
        console.log(`선택지 로드 시도: /api/admin/questions/${question.id}/choices`);
        const response = await fetch(`/api/admin/questions/${question.id}/choices`);
        console.log("응답 상태:", response.status, response.statusText);
        
        if (response.ok) {
          const choices = await response.json();
          console.log("로드된 선택지:", choices);
          
          const formattedChoices = choices.map((choice: any) => ({
            content: choice.content,
            isCorrect: choice.isCorrect
          }));
          
          // 4개 선택지 보장
          while (formattedChoices.length < 4) {
            formattedChoices.push({ content: "", isCorrect: false });
          }
          
          console.log("포맷된 선택지:", formattedChoices);
          
          setEditForm(prev => ({
            ...prev,
            choices: formattedChoices.slice(0, 4)
          }));
        } else {
          const errorText = await response.text();
          console.error("선택지 로드 실패 - 응답 에러:", response.status, errorText);
        }
      } catch (error) {
        console.error("선택지 로드 실패:", error);
      }
    }

    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingQuestion) return;

    // 기본 검증
    if (!editForm.stem.trim()) {
      toast({
        title: "오류",
        description: "문제 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const questionData = {
      stem: editForm.stem,
      explanation: editForm.explanation || null,
      tags: editForm.tags || null,
      difficulty: editForm.difficulty ? parseInt(editForm.difficulty) : null,
      source: editForm.source || null,
      answer: editingQuestion.type === "OX" ? editForm.answer : null,
    };

    let choices: any[] | undefined = undefined;
    
    if (editingQuestion.type === "MCQ") {
      // MCQ 선택지 검증
      const validChoices = editForm.choices.filter(choice => choice.content.trim());
      const correctChoices = validChoices.filter(choice => choice.isCorrect);
      
      if (validChoices.length < 2) {
        toast({
          title: "오류",
          description: "최소 2개의 선택지를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      if (correctChoices.length !== 1) {
        toast({
          title: "오류",
          description: "정답은 정확히 1개여야 합니다.",
          variant: "destructive",
        });
        return;
      }

      choices = validChoices.map(choice => ({
        content: choice.content,
        isCorrect: choice.isCorrect
      }));
    }

    updateQuestionMutation.mutate({
      questionId: editingQuestion.id,
      questionData,
      choices
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>문제 관리</CardTitle>
          <CardDescription>등록된 문제를 확인하고 삭제할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-3">
            <Spinner size="md" className="text-blue-500" />
            문제 목록 로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>문제 관리</CardTitle>
        <CardDescription>등록된 문제를 확인하고 삭제할 수 있습니다. (총 {questions?.length || 0}개)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions && questions.length > 0 ? (
            questions.map((question: any) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={question.type === "MCQ" ? "default" : "secondary"}>
                        {question.type === "MCQ" ? "사지선다" : "OX"}
                      </Badge>
                      {question.author === "wangsohee" && (
                        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                          👑 왕소희 제작
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">ID: {question.id}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {question.stem}
                    </p>
                    {question.tags && (
                      <p className="text-xs text-gray-500">태그: {question.tags}</p>
                    )}
                    {question.difficulty && (
                      <p className="text-xs text-gray-500">난이도: {question.difficulty}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                      data-testid={`button-edit-${question.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id, question.stem)}
                      disabled={deleteQuestionMutation.isPending}
                      data-testid={`button-delete-${question.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deleteQuestionMutation.isPending ? "삭제 중..." : "삭제"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              등록된 문제가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
      
      {/* 편집 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문제 수정</DialogTitle>
            <DialogDescription>
              {editingQuestion?.type === "MCQ" ? "객관식" : "OX"} 문제를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 문제 내용 */}
            <div>
              <Label htmlFor="edit-stem">문제 내용</Label>
              <Textarea
                id="edit-stem"
                value={editForm.stem}
                onChange={(e) => setEditForm(prev => ({ ...prev, stem: e.target.value }))}
                placeholder="문제 내용을 입력하세요"
                className="min-h-20"
                data-testid="textarea-edit-stem"
              />
            </div>

            {/* OX 문제의 정답 선택 */}
            {editingQuestion?.type === "OX" && (
              <div>
                <Label htmlFor="edit-answer">정답</Label>
                <Select 
                  value={editForm.answer?.toString() || ""} 
                  onValueChange={(value) => setEditForm(prev => ({ 
                    ...prev, 
                    answer: value === "true" ? true : value === "false" ? false : null 
                  }))}
                >
                  <SelectTrigger data-testid="select-edit-answer">
                    <SelectValue placeholder="정답을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">O (참)</SelectItem>
                    <SelectItem value="false">X (거짓)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* MCQ 문제의 선택지 */}
            {editingQuestion?.type === "MCQ" && (
              <div>
                <Label>선택지</Label>
                <div className="space-y-3">
                  {editForm.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={choice.content}
                        onChange={(e) => {
                          const newChoices = [...editForm.choices];
                          newChoices[index].content = e.target.value;
                          setEditForm(prev => ({ ...prev, choices: newChoices }));
                        }}
                        placeholder={`선택지 ${index + 1}`}
                        className="flex-1"
                        data-testid={`input-edit-choice-${index + 1}`}
                      />
                      <label className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name="edit-correct-answer"
                          checked={choice.isCorrect}
                          onChange={() => {
                            const newChoices = editForm.choices.map((c, i) => ({
                              ...c,
                              isCorrect: i === index
                            }));
                            setEditForm(prev => ({ ...prev, choices: newChoices }));
                          }}
                          data-testid={`radio-edit-correct-${index + 1}`}
                        />
                        <span className="text-sm">정답</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 해설 */}
            <div>
              <Label htmlFor="edit-explanation">해설</Label>
              <Textarea
                id="edit-explanation"
                value={editForm.explanation}
                onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="해설을 입력하세요"
                data-testid="textarea-edit-explanation"
              />
            </div>

            {/* 태그 */}
            <div>
              <Label htmlFor="edit-tags">태그</Label>
              <Input
                id="edit-tags"
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="태그를 입력하세요"
                data-testid="input-edit-tags"
              />
            </div>

            {/* 난이도 */}
            <div>
              <Label htmlFor="edit-difficulty">난이도</Label>
              <Select 
                value={editForm.difficulty} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger data-testid="select-edit-difficulty">
                  <SelectValue placeholder="난이도를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (쉬움)</SelectItem>
                  <SelectItem value="2">2 (보통)</SelectItem>
                  <SelectItem value="3">3 (어려움)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 출처 */}
            <div>
              <Label htmlFor="edit-source">출처</Label>
              <Input
                id="edit-source"
                value={editForm.source}
                onChange={(e) => setEditForm(prev => ({ ...prev, source: e.target.value }))}
                placeholder="출처를 입력하세요"
                data-testid="input-edit-source"
              />
            </div>

            {/* 버튼들 */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                data-testid="button-edit-cancel"
              >
                취소
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={updateQuestionMutation.isPending}
                data-testid="button-edit-save"
              >
                {updateQuestionMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // OX 문제 상태
  const [oxForm, setOxForm] = useState({
    questionId: "",
    stem: "",
    answer: "",
    explanation: "",
    tags: "",
    difficulty: "",
    source: "",
    author: "default"
  });

  // 사지선다 문제 상태
  const [mcqForm, setMcqForm] = useState({
    questionId: "",
    stem: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
    correctAnswer: "",
    explanation: "",
    tags: "",
    difficulty: "",
    source: "",
    author: "default"
  });



  const createQuestionMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "문제가 성공적으로 등록되었습니다.",
      });
      // 캐시 무효화하여 문제 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      // 폼 초기화
      setOxForm({
        questionId: "",
        stem: "",
        answer: "",
        explanation: "",
        tags: "",
        difficulty: "",
        source: "",
        author: "default"
      });
      setMcqForm({
        questionId: "",
        stem: "",
        choice1: "",
        choice2: "",
        choice3: "",
        choice4: "",
        correctAnswer: "",
        explanation: "",
        tags: "",
        difficulty: "",
        source: "",
        author: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "문제 등록에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // CSV 파일 상태와 참조
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV 다운로드 함수
  const handleCsvDownload = async () => {
    try {
      const response = await fetch("/api/admin/questions/download");
      if (!response.ok) {
        throw new Error("다운로드에 실패했습니다.");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kb_exam_questions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "성공",
        description: "문제 데이터가 성공적으로 다운로드되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류", 
        description: "다운로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const csvUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        console.log('CSV 업로드 시작:', file.name, `크기: ${file.size}바이트`);
        
        const formData = new FormData();
        formData.append('csv', file);
        
        const response = await fetch("/api/admin/questions/csv", {
          method: "POST",
          body: formData,
        });
        
        console.log('서버 응답:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('서버 오류 응답:', errorText);
          throw new Error(`서버 오류 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        console.log('업로드 성공 결과:', result);
        return result;
      } catch (networkError) {
        console.error('네트워크 또는 처리 오류:', networkError);
        
        if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
          throw new Error('서버 연결 실패: 네트워크 문제 또는 서버가 응답하지 않습니다.');
        }
        
        throw networkError;
      }
    },
    onSuccess: (data) => {
      let description = data.message || "CSV 파일이 성공적으로 업로드되었습니다.";
      
      // 에러가 있으면 첫 번째 에러 메시지를 추가로 표시
      if (data.errors && data.errors.length > 0) {
        description += `\n첫 번째 오류: ${data.errors[0].error}`;
      }
      
      toast({
        title: data.errors && data.errors.length > 0 ? "부분 성공" : "성공",
        description,
        variant: data.errors && data.errors.length > 0 ? "destructive" : "default",
      });
      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "CSV 업로드에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "오류",
        description: "CSV 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
    }
  };

  const handleCsvUpload = () => {
    if (csvFile) {
      csvUploadMutation.mutate(csvFile);
    }
  };

  // 모든 데이터 삭제 mutation
  const clearDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/questions/clear", {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "삭제 완료",
        description: data.message || "모든 데이터가 삭제되었습니다.",
      });
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "데이터 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleClearData = () => {
    if (window.confirm("⚠️ 정말로 모든 문제와 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!")) {
      clearDataMutation.mutate();
    }
  };



  const handleOxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuestionMutation.mutate({
      type: "OX",
      ...oxForm,
      answer: oxForm.answer === "O",
      difficulty: oxForm.difficulty ? parseInt(oxForm.difficulty) : null,
    });
  };

  const handleMcqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuestionMutation.mutate({
      type: "MCQ",
      questionId: mcqForm.questionId,
      stem: mcqForm.stem,
      explanation: mcqForm.explanation,
      tags: mcqForm.tags,
      difficulty: mcqForm.difficulty ? parseInt(mcqForm.difficulty) : null,
      source: mcqForm.source,
      author: mcqForm.author,
      choices: [
        { content: mcqForm.choice1, isCorrect: mcqForm.correctAnswer === "1" },
        { content: mcqForm.choice2, isCorrect: mcqForm.correctAnswer === "2" },
        { content: mcqForm.choice3, isCorrect: mcqForm.correctAnswer === "3" },
        { content: mcqForm.choice4, isCorrect: mcqForm.correctAnswer === "4" },
      ]
    });
  };

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>문제 등록 관리</CardTitle>
            <CardDescription>새로운 문제를 등록하거나 일괄 등록할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="stats">조회수 통계</TabsTrigger>
                <TabsTrigger value="comments">댓글 관리</TabsTrigger>
                <TabsTrigger value="manage">문제 관리</TabsTrigger>
                <TabsTrigger value="ox">OX 문제</TabsTrigger>
                <TabsTrigger value="mcq">사지선다</TabsTrigger>
                <TabsTrigger value="csv">CSV 업로드</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-4">
                <StatsCard />
                <DailyVisitChart />
                <VisitorStatsCard />
                <ModeStatsCard />
                <QuestionStatsCard />
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <CommentManagementCard />
              </TabsContent>

              <TabsContent value="manage" className="space-y-4">
                <ManageQuestionsCard />
              </TabsContent>

              <TabsContent value="ox" className="space-y-4">
                <form onSubmit={handleOxSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ox-id">문제 ID</Label>
                      <Input
                        id="ox-id"
                        value={oxForm.questionId}
                        onChange={(e) => setOxForm({...oxForm, questionId: e.target.value})}
                        placeholder="예: q10"
                        required
                        data-testid="input-ox-question-id"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ox-answer">정답</Label>
                      <Select value={oxForm.answer} onValueChange={(value) => setOxForm({...oxForm, answer: value})}>
                        <SelectTrigger data-testid="select-ox-answer">
                          <SelectValue placeholder="O 또는 X 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="O">O (참)</SelectItem>
                          <SelectItem value="X">X (거짓)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ox-stem">문제 내용</Label>
                    <Textarea
                      id="ox-stem"
                      value={oxForm.stem}
                      onChange={(e) => setOxForm({...oxForm, stem: e.target.value})}
                      placeholder="문제 내용을 입력하세요"
                      required
                      data-testid="textarea-ox-stem"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ox-explanation">해설</Label>
                    <Textarea
                      id="ox-explanation"
                      value={oxForm.explanation}
                      onChange={(e) => setOxForm({...oxForm, explanation: e.target.value})}
                      placeholder="정답 해설을 입력하세요"
                      required
                      data-testid="textarea-ox-explanation"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="ox-tags">태그</Label>
                      <Input
                        id="ox-tags"
                        value={oxForm.tags}
                        onChange={(e) => setOxForm({...oxForm, tags: e.target.value})}
                        placeholder="예: 환율우대"
                        data-testid="input-ox-tags"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ox-difficulty">난이도</Label>
                      <Select value={oxForm.difficulty} onValueChange={(value) => setOxForm({...oxForm, difficulty: value})}>
                        <SelectTrigger data-testid="select-ox-difficulty">
                          <SelectValue placeholder="난이도 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (쉬움)</SelectItem>
                          <SelectItem value="2">2 (보통)</SelectItem>
                          <SelectItem value="3">3 (어려움)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ox-author">작성자</Label>
                      <Select value={oxForm.author} onValueChange={(value) => setOxForm({...oxForm, author: value})}>
                        <SelectTrigger data-testid="select-ox-author">
                          <SelectValue placeholder="작성자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">기본 문제</SelectItem>
                          <SelectItem value="wangsohee">👑 왕소희 제작</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ox-source">출처</Label>
                      <Input
                        id="ox-source"
                        value={oxForm.source}
                        onChange={(e) => setOxForm({...oxForm, source: e.target.value})}
                        placeholder="예: 외환 규정집"
                        data-testid="input-ox-source"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createQuestionMutation.isPending}
                    data-testid="button-submit-ox"
                  >
                    {createQuestionMutation.isPending ? "등록 중..." : "OX 문제 등록"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="mcq" className="space-y-4">
                <form onSubmit={handleMcqSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mcq-id">문제 ID</Label>
                      <Input
                        id="mcq-id"
                        value={mcqForm.questionId}
                        onChange={(e) => setMcqForm({...mcqForm, questionId: e.target.value})}
                        placeholder="예: q11"
                        required
                        data-testid="input-mcq-question-id"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcq-correct">정답 번호</Label>
                      <Select value={mcqForm.correctAnswer} onValueChange={(value) => setMcqForm({...mcqForm, correctAnswer: value})}>
                        <SelectTrigger data-testid="select-mcq-correct">
                          <SelectValue placeholder="정답 번호 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1번</SelectItem>
                          <SelectItem value="2">2번</SelectItem>
                          <SelectItem value="3">3번</SelectItem>
                          <SelectItem value="4">4번</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mcq-stem">문제 내용</Label>
                    <Textarea
                      id="mcq-stem"
                      value={mcqForm.stem}
                      onChange={(e) => setMcqForm({...mcqForm, stem: e.target.value})}
                      placeholder="문제 내용을 입력하세요"
                      required
                      data-testid="textarea-mcq-stem"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mcq-choice1">선택지 1</Label>
                      <Input
                        id="mcq-choice1"
                        value={mcqForm.choice1}
                        onChange={(e) => setMcqForm({...mcqForm, choice1: e.target.value})}
                        placeholder="1번 선택지"
                        required
                        data-testid="input-mcq-choice1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcq-choice2">선택지 2</Label>
                      <Input
                        id="mcq-choice2"
                        value={mcqForm.choice2}
                        onChange={(e) => setMcqForm({...mcqForm, choice2: e.target.value})}
                        placeholder="2번 선택지"
                        required
                        data-testid="input-mcq-choice2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcq-choice3">선택지 3</Label>
                      <Input
                        id="mcq-choice3"
                        value={mcqForm.choice3}
                        onChange={(e) => setMcqForm({...mcqForm, choice3: e.target.value})}
                        placeholder="3번 선택지"
                        required
                        data-testid="input-mcq-choice3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcq-choice4">선택지 4</Label>
                      <Input
                        id="mcq-choice4"
                        value={mcqForm.choice4}
                        onChange={(e) => setMcqForm({...mcqForm, choice4: e.target.value})}
                        placeholder="4번 선택지"
                        required
                        data-testid="input-mcq-choice4"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mcq-explanation">해설</Label>
                    <Textarea
                      id="mcq-explanation"
                      value={mcqForm.explanation}
                      onChange={(e) => setMcqForm({...mcqForm, explanation: e.target.value})}
                      placeholder="정답 해설을 입력하세요"
                      required
                      data-testid="textarea-mcq-explanation"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="mcq-tags">태그</Label>
                      <Input
                        id="mcq-tags"
                        value={mcqForm.tags}
                        onChange={(e) => setMcqForm({...mcqForm, tags: e.target.value})}
                        placeholder="예: 환율우대"
                        data-testid="input-mcq-tags"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcq-difficulty">난이도</Label>
                      <Select value={mcqForm.difficulty} onValueChange={(value) => setMcqForm({...mcqForm, difficulty: value})}>
                        <SelectTrigger data-testid="select-mcq-difficulty">
                          <SelectValue placeholder="난이도 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (쉬움)</SelectItem>
                          <SelectItem value="2">2 (보통)</SelectItem>
                          <SelectItem value="3">3 (어려움)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mcq-author">작성자</Label>
                      <Select value={mcqForm.author} onValueChange={(value) => setMcqForm({...mcqForm, author: value})}>
                        <SelectTrigger data-testid="select-mcq-author">
                          <SelectValue placeholder="작성자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">기본 문제</SelectItem>
                          <SelectItem value="wangsohee">👑 왕소희 제작</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mcq-source">출처</Label>
                      <Input
                        id="mcq-source"
                        value={mcqForm.source}
                        onChange={(e) => setMcqForm({...mcqForm, source: e.target.value})}
                        placeholder="예: 외환 규정집"
                        data-testid="input-mcq-source"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createQuestionMutation.isPending}
                    data-testid="button-submit-mcq"
                  >
                    {createQuestionMutation.isPending ? "등록 중..." : "사지선다 문제 등록"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="csv" className="space-y-4">
                <div className="space-y-4">
                  {/* CSV 다운로드 섹션 */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">📥 현재 문제 데이터 다운로드</h3>
                    <p className="text-sm text-green-700 mb-3">
                      현재 데이터베이스에 저장된 모든 문제를 CSV 파일로 다운로드할 수 있습니다.
                    </p>
                    <Button
                      onClick={handleCsvDownload}
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-100"
                      data-testid="button-download-csv"
                    >
                      📁 CSV 파일 다운로드 (100개 문제)
                    </Button>
                  </div>

                  {/* CSV 업로드 섹션 */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">📤 CSV 파일 업로드</h3>
                    <div>
                      <Label htmlFor="csv-file">CSV 파일 선택</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="cursor-pointer"
                        data-testid="input-csv-file"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        CSV 파일 형식: question_id, stem, explanation, tags, difficulty, source, answer/choices
                      </p>
                    </div>
                    
                    {csvFile && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-3">
                        <p className="text-sm text-blue-700">
                          선택된 파일: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleCsvUpload}
                      disabled={!csvFile || csvUploadMutation.isPending}
                      className="w-full mt-3"
                      data-testid="button-upload-csv"
                    >
                      {csvUploadMutation.isPending ? "업로드 중..." : "CSV 파일 업로드"}
                    </Button>
                  </div>

                  {/* 데이터 삭제 섹션 */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">🗑️ 모든 데이터 삭제</h3>
                    <p className="text-sm text-red-700 mb-3">
                      ⚠️ 위험: 데이터베이스의 모든 문제와 선택지를 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <Button
                      onClick={handleClearData}
                      disabled={clearDataMutation.isPending}
                      variant="destructive"
                      className="w-full"
                      data-testid="button-clear-data"
                    >
                      {clearDataMutation.isPending ? "삭제 중..." : "⚠️ 모든 데이터 삭제"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
        
        {/* 로그아웃 버튼 */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setIsAuthenticated(false)}
            data-testid="button-admin-logout"
          >
            🔓 로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}