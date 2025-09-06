import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { SessionResponse, AnswerResponse, QuestionWithChoices } from "@shared/schema";

interface QuestionProps {
  sessionData: SessionResponse;
  onAnswer: (answer: { selectedChoiceId?: string; selectedBoolean?: boolean }) => void;
  onNext: () => void;
  answerResult?: AnswerResponse;
  isLoading?: boolean;
}

export default function Question({ sessionData, onAnswer, onNext, answerResult, isLoading }: QuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const { question, currentQuestion, totalQuestions } = sessionData;

  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  const handleAnswerSelect = (answer: string | boolean) => {
    if (answerResult) return; // Already answered

    setSelectedAnswer(answer);
    
    if (question.type === "MCQ") {
      onAnswer({ selectedChoiceId: answer as string });
    } else {
      onAnswer({ selectedBoolean: answer as boolean });
    }
  };

  const getChoiceButtonClass = (choiceId: string, isCorrect: boolean) => {
    if (!answerResult) {
      return "w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
    }

    // 내가 선택한 답
    if (selectedAnswer === choiceId) {
      return isCorrect
        ? "w-full text-left p-4 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-gray-900 dark:text-green-100"
        : "w-full text-left p-4 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-gray-900 dark:text-red-100";
    }

    // 정답인 선택지는 항상 초록색으로 표시
    if (isCorrect) {
      return "w-full text-left p-4 rounded-lg border-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-gray-900 dark:text-green-100";
    }

    return "w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
  };

  const getOXButtonClass = (value: boolean) => {
    if (!answerResult) {
      return "w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
    }

    const isCorrect = value === question.answer;

    // 내가 선택한 답
    if (selectedAnswer === value) {
      return isCorrect
        ? "w-full text-left p-4 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-gray-900 dark:text-green-100"
        : "w-full text-left p-4 rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-gray-900 dark:text-red-100";
    }

    // 정답은 항상 초록색으로 표시
    if (isCorrect) {
      return "w-full text-left p-4 rounded-lg border-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 text-gray-900 dark:text-green-100";
    }

    return "w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      {/* Progress Bar */}
      <Card className="mb-6 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">진행상황</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-progress">
              {currentQuestion} / {totalQuestions}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Feedback Banner */}
      {answerResult && (
        <div className="mb-6" data-testid="feedback-banner">
          {answerResult.isCorrect ? (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-green-800 dark:text-green-200 font-medium">정답입니다</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-red-800 dark:text-red-200 font-medium">오답입니다</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Card */}
      <Card className="mb-6 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="mb-6">
            <p className="text-lg text-gray-900 dark:text-white leading-relaxed" data-testid="text-question-stem">
              {question.stem}
            </p>
          </div>

          {/* MCQ Options */}
          {question.type === "MCQ" && question.choices && (
            <div className="space-y-3">
              {question.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleAnswerSelect(choice.id)}
                  disabled={!!answerResult}
                  className={getChoiceButtonClass(choice.id, choice.isCorrect)}
                  data-testid={`button-choice-${choice.id}`}
                >
                  <span className={`font-medium ${
                    answerResult && selectedAnswer === choice.id && choice.isCorrect
                      ? "text-green-700 dark:text-green-200"
                      : answerResult && selectedAnswer === choice.id && !choice.isCorrect
                      ? "text-red-700 dark:text-red-200"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {choice.content}
                  </span>
                  {answerResult && selectedAnswer === choice.id && choice.isCorrect && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* OX Options */}
          {question.type === "OX" && (
            <div className="space-y-3">
              <button
                onClick={() => handleAnswerSelect(true)}
                disabled={!!answerResult}
                className={getOXButtonClass(true)}
                data-testid="button-ox-true"
              >
                <span className={`font-medium text-xl ${
                  answerResult && selectedAnswer === true && question.answer === true
                    ? "text-green-700 dark:text-green-200"
                    : answerResult && selectedAnswer === true && question.answer !== true
                    ? "text-red-700 dark:text-red-200"
                    : "text-gray-900 dark:text-white"
                }`}>
                  O (맞음)
                </span>
                {answerResult && selectedAnswer === true && question.answer === true && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </button>
              <button
                onClick={() => handleAnswerSelect(false)}
                disabled={!!answerResult}
                className={getOXButtonClass(false)}
                data-testid="button-ox-false"
              >
                <span className={`font-medium text-xl ${
                  answerResult && selectedAnswer === false && question.answer === false
                    ? "text-green-700 dark:text-green-200"
                    : answerResult && selectedAnswer === false && question.answer !== false
                    ? "text-red-700 dark:text-red-200"
                    : "text-gray-900 dark:text-white"
                }`}>
                  X (틀림)
                </span>
                {answerResult && selectedAnswer === false && question.answer === false && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation Box */}
      {answerResult && (
        <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="font-semibold text-gray-900 dark:text-white mb-3">해설</div>
            <div 
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
              data-testid="text-explanation"
            >
              {answerResult.explanation}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Question Button */}
      {answerResult && (
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          data-testid="button-next-question"
        >
          {isLoading && <Spinner size="sm" className="text-white" />}
          {isLoading ? "다음 문제 준비 중..." : "다음 문제"}
        </Button>
      )}
    </div>
  );
}
