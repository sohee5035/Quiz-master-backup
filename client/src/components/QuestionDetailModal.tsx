import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CheckCircle, XCircle, Users, Target, BookOpen, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuestionDetailModalProps {
  questionId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionDetailData {
  question: {
    id: string;
    type: string;
    stem: string;
    explanation: string | null;
    difficulty: number | null;
    author: string;
  };
  choices: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  choiceStats: Array<{
    choiceId: string | null;
    content: string;
    isCorrect: boolean;
    count: number;
    percentage: number;
  }>;
  booleanStats?: Array<{
    value: boolean;
    count: number;
    percentage: number;
    isCorrect: boolean;
  }>;
  totalResponses: number;
  correctResponses: number;
  accuracy: number;
}

export default function QuestionDetailModal({ questionId, isOpen, onClose }: QuestionDetailModalProps) {
  const { data: detailData, isLoading } = useQuery<{ success: boolean; data: QuestionDetailData }>({
    queryKey: [`/api/admin/question-details/${questionId}`],
    enabled: isOpen && !!questionId,
  });

  if (!isOpen) return null;

  const detail = detailData?.data;

  const getDifficultyText = (difficulty: number | null) => {
    if (difficulty === 1) return { text: "쉬움", color: "bg-green-100 text-green-800" };
    if (difficulty === 2) return { text: "보통", color: "bg-yellow-100 text-yellow-800" };
    if (difficulty === 3) return { text: "어려움", color: "bg-red-100 text-red-800" };
    return { text: "미설정", color: "bg-gray-100 text-gray-800" };
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 bg-green-50";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              문제 상세 분석
            </DialogTitle>
            <DialogDescription>
              문제별 선택지 통계와 해설을 확인하세요
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : !detail ? (
          <div className="text-center py-8 text-gray-500">
            데이터를 불러올 수 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 문제 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">📝 문제 정보</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyText(detail.question.difficulty).color}>
                      {getDifficultyText(detail.question.difficulty).text}
                    </Badge>
                    <Badge className={detail.question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                      {detail.question.type === 'MCQ' ? '사지선다' : 'OX'}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800">
                      {detail.question.id}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white leading-relaxed">
                      {detail.question.stem}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">총 응답</p>
                      <p className="text-lg font-bold text-blue-600">{detail.totalResponses}명</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">정답자</p>
                      <p className="text-lg font-bold text-green-600">{detail.correctResponses}명</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Target className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">정답률</p>
                      <p className={`text-lg font-bold ${detail.accuracy >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {detail.accuracy.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 선택지별 응답 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  📊 {detail.question.type === 'MCQ' ? '선택지별 응답 통계' : 'OX 응답 통계'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detail.question.type === 'MCQ' ? (
                    // MCQ 선택지 통계
                    detail.choiceStats.map((stat, index) => (
                      <div key={stat.choiceId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {stat.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-medium">
                              {String.fromCharCode(65 + index)}번
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${stat.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {stat.isCorrect ? '정답' : '오답'}
                            </span>
                            {stat.count > 0 && stat.count === Math.max(...detail.choiceStats.map(s => s.count)) && !stat.isCorrect && (
                              <Badge className="bg-red-100 text-red-800">가장 많은 오답</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg">{stat.count}명</span>
                            <span className="text-sm text-gray-500 ml-2">({stat.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              stat.isCorrect 
                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                : 'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 ml-7">
                          {stat.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    // OX 선택지 통계
                    detail.booleanStats?.map((stat) => (
                      <div key={stat.value.toString()} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {stat.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-medium text-lg">
                              {stat.value ? 'O (참)' : 'X (거짓)'}
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${stat.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {stat.isCorrect ? '정답' : '오답'}
                            </span>
                            {detail.booleanStats && stat.count > 0 && 
                             stat.count === Math.max(...detail.booleanStats.map(s => s.count)) && !stat.isCorrect && (
                              <Badge className="bg-red-100 text-red-800">가장 많은 오답</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg">{stat.count}명</span>
                            <span className="text-sm text-gray-500 ml-2">({stat.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              stat.isCorrect 
                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                : 'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 해설 */}
            {detail.question.explanation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    💡 문제 해설
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {detail.question.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center pt-4 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                * 데이터는 실시간으로 업데이트됩니다
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}