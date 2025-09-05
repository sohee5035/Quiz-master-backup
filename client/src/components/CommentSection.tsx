import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function CommentSection() {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 댓글 목록 조회
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: () => api.getComments(),
  });

  // 댓글 작성
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => api.createComment(content),
    onSuccess: (data) => {
      toast({
        title: "댓글 등록 완료",
        description: data.message,
      });
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "댓글 등록에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast({
        title: "알림",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (comment.length > 500) {
      toast({
        title: "알림",
        description: "댓글은 500자 이하로 작성해주세요.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate(comment);
  };

  const comments = commentsData?.comments || [];

  return (
    <Card className="mt-8 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">💬 문제점이나 의견 남겨주세요!</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          앱 개선을 위한 소중한 의견을 기다립니다. 익명으로 댓글을 남기실 수 있습니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 댓글 작성 */}
        <div className="space-y-3">
          <Textarea
            placeholder="문제점이나 개선사항, 의견 등을 자유롭게 남겨주세요... (최대 500자)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={4}
            maxLength={500}
            data-testid="textarea-comment"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {comment.length}/500자
            </span>
            <Button
              onClick={handleSubmit}
              disabled={createCommentMutation.isPending || !comment.trim()}
              className="bg-blue-500 hover:bg-blue-600"
              data-testid="button-submit-comment"
            >
              {createCommentMutation.isPending ? "등록 중..." : "댓글 등록"}
            </Button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              등록된 댓글 ({comments.length}개)
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">댓글을 불러오는 중...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                아직 등록된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 rounded-lg p-3 border"
                    data-testid={`comment-${comment.id}`}
                  >
                    <div className="text-sm text-gray-900 whitespace-pre-wrap mb-2">
                      {comment.content}
                    </div>
                    <div className="text-xs text-gray-500">
                      {comment.createdAt 
                        ? format(new Date(comment.createdAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })
                        : "방금 전"
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}