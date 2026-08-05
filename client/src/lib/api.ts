import { apiRequest } from "./queryClient";
import type { SessionResponse, AnswerResponse, ResultsResponse, LoginResponse, SessionHistoryItem, Question } from "@shared/schema";

export const api = {
  startSession: async (
    mode: string = "study",
    questionCount?: number,
    difficulty?: number,
    subject?: string,
    employeeId?: string,
  ): Promise<SessionResponse> => {
    const body: any = { mode };
    if (questionCount) {
      body.questionCount = questionCount;
    }
    if (difficulty) {
      body.difficulty = difficulty;
    }
    if (subject && subject !== "all") {
      body.subject = subject;
    }
    if (employeeId) {
      body.employeeId = employeeId;
    }
    const response = await apiRequest("POST", "/api/session/start", body);
    return response.json();
  },

  login: async (employeeId: string): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/login", { employeeId });
    return response.json();
  },

  getSubjects: async (): Promise<string[]> => {
    const response = await apiRequest("GET", "/api/subjects");
    const data = await response.json();
    return data.subjects;
  },

  getMySessions: async (employeeId: string): Promise<SessionHistoryItem[]> => {
    const response = await apiRequest("GET", `/api/employees/${employeeId}/sessions`);
    const data = await response.json();
    return data.sessions;
  },

  getWrongQuestionCount: async (employeeId: string): Promise<number> => {
    const response = await apiRequest("GET", `/api/employees/${employeeId}/wrong-questions`);
    const data = await response.json();
    return data.count;
  },

  getBookmarkedQuestions: async (employeeId: string): Promise<Question[]> => {
    const response = await apiRequest("GET", `/api/employees/${employeeId}/bookmarks`);
    const data = await response.json();
    return data.questions;
  },

  addBookmark: async (employeeId: string, questionId: string): Promise<void> => {
    await apiRequest("POST", `/api/employees/${employeeId}/bookmarks`, { questionId });
  },

  removeBookmark: async (employeeId: string, questionId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/employees/${employeeId}/bookmarks/${questionId}`);
  },

  getNextQuestion: async (sessionId: string): Promise<SessionResponse> => {
    const response = await apiRequest("GET", `/api/session/${sessionId}/next`);
    return response.json();
  },

  submitAnswer: async (
    sessionId: string,
    answer: { selectedChoiceId?: string; selectedBoolean?: boolean }
  ): Promise<AnswerResponse> => {
    const response = await apiRequest("POST", `/api/session/${sessionId}/answer`, answer);
    return response.json();
  },

  finishSession: async (sessionId: string): Promise<ResultsResponse> => {
    const response = await apiRequest("POST", `/api/session/${sessionId}/finish`);
    return response.json();
  },

  // Comment APIs
  createComment: async (content: string): Promise<{ success: boolean; message: string; comment: any }> => {
    const response = await apiRequest("POST", "/api/comments", { content });
    return response.json();
  },

  getComments: async (): Promise<{ success: boolean; comments: any[]; total: number }> => {
    const response = await apiRequest("GET", "/api/comments");
    return response.json();
  },

  // Question management APIs
  updateQuestion: async (questionId: string, questionData: any, choices?: any[]): Promise<{ success: boolean; message: string; question: any }> => {
    const response = await apiRequest("PUT", `/api/admin/questions/${questionId}`, {
      question: questionData,
      choices: choices
    });
    return response.json();
  },
};
