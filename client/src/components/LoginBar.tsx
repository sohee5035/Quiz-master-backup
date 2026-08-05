import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { storeEmployee } from "@/lib/auth";
import type { LoginResponse } from "@shared/schema";

interface LoginBarProps {
  employee: LoginResponse | null;
  onLogin: (employee: LoginResponse) => void;
  onOpenMyPage: () => void;
}

export default function LoginBar({ employee, onLogin, onOpenMyPage }: LoginBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!employeeId.trim()) {
      setError("직원번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.login(employeeId.trim());
      storeEmployee(result);
      onLogin(result);
      setIsOpen(false);
      setEmployeeId("");
      toast({
        title: `어서오세요 ${result.name}님`,
        description: "이제 이력, 틀린 문제, 북마크 기능을 이용할 수 있어요.",
      });
    } catch (err: any) {
      setError("등록되지 않은 직원번호입니다. 관리자에게 등록을 요청해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        {employee ? (
          <Button
            onClick={onOpenMyPage}
            className="shadow-lg rounded-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white px-4 py-2 h-auto"
            data-testid="button-floating-mypage"
          >
            👤 {employee.name}님
          </Button>
        ) : (
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="shadow-lg rounded-full bg-white dark:bg-gray-800 px-4 py-2 h-auto"
            data-testid="button-floating-login"
          >
            로그인
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setError(null); }}>
        <DialogContent data-testid="dialog-login">
          <DialogHeader>
            <DialogTitle>직원번호로 로그인</DialogTitle>
            <DialogDescription>
              비밀번호 없이 직원번호만 입력하면 됩니다. (관리자가 미리 등록한 번호만 가능)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
              placeholder="직원번호를 입력하세요"
              autoFocus
              data-testid="input-login-employee-id"
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" data-testid="text-login-error">{error}</p>
            )}
            <Button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white"
              data-testid="button-login-submit"
            >
              {isSubmitting ? "확인 중..." : "확인"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
