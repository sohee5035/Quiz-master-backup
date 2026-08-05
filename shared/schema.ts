import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'MCQ' or 'OX'
  stem: text("stem").notNull(),
  explanation: text("explanation"),
  tags: text("tags"),
  subject: text("subject"), // 과목: 수신, 개인여신, 기업여신, 집합투자, 신용카드 등
  difficulty: integer("difficulty"),
  source: text("source"),
  answer: boolean("answer"), // for OX questions
  author: text("author").default("default").notNull(), // 'default' or 'wangsohee'
});

export const choices = pgTable("choices", {
  id: text("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id),
  content: text("content").notNull(),
  isCorrect: boolean("is_correct").notNull(),
});

// 직원 명부 (관리자가 사전 등록, 비밀번호 없이 직원번호만으로 로그인)
export const employees = pgTable("employees", {
  id: text("id").primaryKey(), // 직원번호
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  mode: text("mode").notNull(), // 'study', 'mock', 'review', 'wangsohee', 'wrong', 'bookmarked'
  ipAddress: text("ip_address"),
  employeeId: text("employee_id").references(() => employees.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// 직원별 북마크(체크)한 문제
export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  questionId: text("question_id").notNull().references(() => questions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const responses = pgTable("responses", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  questionId: text("question_id").notNull().references(() => questions.id),
  choiceId: text("choice_id").references(() => choices.id),
  selectedBoolean: boolean("selected_boolean"),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: text("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  page: text("page").notNull(),
  visitedAt: timestamp("visited_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questions);
export const insertChoiceSchema = createInsertSchema(choices);
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, startedAt: true, endedAt: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true, createdAt: true });
export const insertPageViewSchema = createInsertSchema(pageViews).omit({ id: true, visitedAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ createdAt: true });
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });

export type Question = typeof questions.$inferSelect;
export type Choice = typeof choices.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertChoice = z.infer<typeof insertChoiceSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

// API response types
export type QuestionWithChoices = Question & {
  choices?: Choice[];
};

export type SessionResponse = {
  sessionId: string;
  question: QuestionWithChoices;
  currentQuestion: number;
  totalQuestions: number;
};

export type AnswerResponse = {
  isCorrect: boolean;
  explanation: string;
  nextReady: boolean;
};

export type ResultsResponse = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  questions: Array<{
    question: QuestionWithChoices;
    userAnswer: string | boolean;
    isCorrect: boolean;
  }>;
};

// Timer mode types
export type TimerQuestionData = {
  sessionId: string;
  question: QuestionWithChoices;
  currentQuestion: number;
  totalQuestions: number;
  isAnswered: boolean;
  userAnswer?: string | boolean;
  isCorrect?: boolean;
  explanation?: string | null;
};

export type TimerResultsData = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectQuestions: TimerQuestionData[];
};

// Employee login / my page types
export type LoginResponse = {
  employeeId: string;
  name: string;
};

export type SessionHistoryItem = {
  sessionId: string;
  mode: string;
  startedAt: string | null;
  totalQuestions: number;
  correctAnswers: number;
};
