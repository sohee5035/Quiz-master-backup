import type { LoginResponse } from "@shared/schema";

const STORAGE_KEY = "quizAppEmployee";

export function getStoredEmployee(): LoginResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.employeeId === "string" && typeof parsed.name === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function storeEmployee(employee: LoginResponse): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
}

export function clearStoredEmployee(): void {
  localStorage.removeItem(STORAGE_KEY);
}
