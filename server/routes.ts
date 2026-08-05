import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getWrongQuestionIdsForEmployee } from "./storage";
import { z } from "zod";
import type { SessionResponse, AnswerResponse, ResultsResponse, QuestionWithChoices, Response, Question, SessionHistoryItem } from "@shared/schema";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// In-memory store for session question orders (simple implementation)
const sessionQuestionOrders: Map<string, string[]> = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  // 특정 문제의 선택지 조회 API
  app.get("/api/admin/questions/:questionId/choices", async (req, res) => {
    try {
      const questionId = req.params.questionId;
      console.log(`✅ 선택지 조회 API 호출됨: questionId=${questionId}`);
      console.log(`Request URL: ${req.originalUrl}`);
      console.log(`Request method: ${req.method}`);
      
      const choices = await storage.getChoicesForQuestion(questionId);
      console.log(`✅ 조회된 선택지 개수: ${choices.length}`);
      console.log(`✅ 선택지 내용:`, choices);
      
      // 명시적으로 JSON 응답 헤더 설정
      res.setHeader('Content-Type', 'application/json');
      const response = JSON.stringify(choices);
      console.log(`✅ 전송할 JSON 응답: ${response}`);
      
      res.status(200).send(response);
    } catch (error) {
      console.error("❌ 선택지 조회 에러:", error);
      res.status(500).json({ message: "선택지 조회에 실패했습니다." });
    }
  });

  // Questions count endpoint
  // Get all questions
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error('Questions error:', error);
      res.status(500).json({ message: "문제 조회 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/questions/count", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json({ count: questions.length });
    } catch (error) {
      console.error('Questions count error:', error);
      res.status(500).json({ message: "문제 수 조회 중 오류가 발생했습니다." });
    }
  });

  // 과목 목록 조회 (문제에 등록된 과목들, 홈 화면 과목 선택용)
  app.get("/api/subjects", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      const subjects = Array.from(
        new Set(questions.map(q => q.subject).filter((s): s is string => !!s))
      ).sort();
      res.json({ subjects });
    } catch (error) {
      console.error('Subjects error:', error);
      res.status(500).json({ message: "과목 목록 조회 중 오류가 발생했습니다." });
    }
  });

  // 직원번호로 로그인 (비밀번호 없음, 관리자가 등록한 명부와 대조)
  app.post("/api/login", async (req, res) => {
    try {
      const { employeeId } = req.body;

      if (!employeeId || typeof employeeId !== "string" || !employeeId.trim()) {
        return res.status(400).json({ message: "직원번호를 입력해주세요." });
      }

      const employee = await storage.getEmployee(employeeId.trim());
      if (!employee) {
        return res.status(404).json({ message: "등록되지 않은 직원번호입니다. 관리자에게 등록을 요청해주세요." });
      }

      res.json({ employeeId: employee.id, name: employee.name });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "로그인에 실패했습니다." });
    }
  });

  // 관리자 API - 직원 명부 조회
  app.get("/api/admin/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json({ employees });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "직원 명부 조회에 실패했습니다." });
    }
  });

  // 관리자 API - 직원 등록
  app.post("/api/admin/employees", async (req, res) => {
    try {
      const { employeeId, name } = req.body;

      if (!employeeId || typeof employeeId !== "string" || !employeeId.trim()) {
        return res.status(400).json({ message: "직원번호를 입력해주세요." });
      }
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "이름을 입력해주세요." });
      }

      const existing = await storage.getEmployee(employeeId.trim());
      if (existing) {
        return res.status(409).json({ message: "이미 등록된 직원번호입니다." });
      }

      const employee = await storage.createEmployee({ id: employeeId.trim(), name: name.trim() });
      res.json({ message: "직원이 등록되었습니다.", employee });
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "직원 등록에 실패했습니다." });
    }
  });

  // 관리자 API - 직원 이름 수정
  app.put("/api/admin/employees/:id", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "이름을 입력해주세요." });
      }

      const employee = await storage.updateEmployee(req.params.id, name.trim());
      res.json({ message: "직원 정보가 수정되었습니다.", employee });
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "직원 정보 수정에 실패했습니다." });
    }
  });

  // 관리자 API - 직원 삭제
  app.delete("/api/admin/employees/:id", async (req, res) => {
    try {
      await storage.deleteEmployee(req.params.id);
      res.json({ message: "직원이 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "직원 삭제에 실패했습니다." });
    }
  });

  // 내 북마크 목록 조회
  app.get("/api/employees/:employeeId/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getBookmarksForEmployee(req.params.employeeId);
      const questionList = (
        await Promise.all(bookmarks.map(b => storage.getQuestion(b.questionId)))
      ).filter((q): q is Question => !!q);

      res.json({ questions: questionList });
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "북마크 조회에 실패했습니다." });
    }
  });

  // 북마크 추가
  app.post("/api/employees/:employeeId/bookmarks", async (req, res) => {
    try {
      const { questionId } = req.body;
      if (!questionId) {
        return res.status(400).json({ message: "문제 ID가 필요합니다." });
      }

      const bookmark = await storage.addBookmark(req.params.employeeId, questionId);
      res.json({ message: "북마크에 추가되었습니다.", bookmark });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      res.status(500).json({ message: "북마크 추가에 실패했습니다." });
    }
  });

  // 북마크 제거
  app.delete("/api/employees/:employeeId/bookmarks/:questionId", async (req, res) => {
    try {
      await storage.removeBookmark(req.params.employeeId, req.params.questionId);
      res.json({ message: "북마크가 제거되었습니다." });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "북마크 제거에 실패했습니다." });
    }
  });

  // 틀린 문제 개수 (현재 기준으로 틀리고 있는 문제)
  app.get("/api/employees/:employeeId/wrong-questions", async (req, res) => {
    try {
      const wrongIds = await getWrongQuestionIdsForEmployee(req.params.employeeId);
      res.json({ count: wrongIds.length, questionIds: wrongIds });
    } catch (error) {
      console.error("Error fetching wrong questions:", error);
      res.status(500).json({ message: "틀린 문제 조회에 실패했습니다." });
    }
  });

  // 내 응시 이력 (마이페이지)
  app.get("/api/employees/:employeeId/sessions", async (req, res) => {
    try {
      const employeeSessions = await storage.getSessionsForEmployee(req.params.employeeId);

      const history: SessionHistoryItem[] = await Promise.all(
        employeeSessions
          .filter(session => session.endedAt) // 완료된 세션만
          .map(async (session) => {
            const sessionResponses = await storage.getResponsesForSession(session.id);
            return {
              sessionId: session.id,
              mode: session.mode,
              startedAt: session.startedAt ? session.startedAt.toISOString() : null,
              totalQuestions: sessionResponses.length,
              correctAnswers: sessionResponses.filter(r => r.isCorrect).length,
            };
          })
      );

      res.json({ sessions: history });
    } catch (error) {
      console.error("Error fetching employee sessions:", error);
      res.status(500).json({ message: "응시 이력 조회에 실패했습니다." });
    }
  });

  // Admin stats endpoint (before page view middleware)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const [todayViews, totalViews, todayUniqueVisitors, totalUniqueVisitors] = await Promise.all([
        storage.getTodayPageViews(),
        storage.getTotalPageViews(),
        storage.getTodayUniqueVisitors(),
        storage.getTotalUniqueVisitors()
      ]);
      
      res.json({
        todayViews,
        totalViews,
        todayUniqueVisitors,
        totalUniqueVisitors
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: "통계 조회 중 오류가 발생했습니다." });
    }
  });

  // Mode usage statistics endpoint
  app.get("/api/admin/mode-stats", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      const modeStats: { [key: string]: number } = {};

      // Count sessions by mode
      for (const session of sessions) {
        const mode = session.mode || 'unknown';
        modeStats[mode] = (modeStats[mode] || 0) + 1;
      }

      // Sort by count descending
      const sortedModeStats = Object.entries(modeStats)
        .map(([mode, count]) => ({ mode, count }))
        .sort((a, b) => b.count - a.count);

      res.json(sortedModeStats);
    } catch (error) {
      console.error('Mode stats error:', error);
      res.status(500).json({ message: "모드 통계 조회 중 오류가 발생했습니다." });
    }
  });

  // Question statistics endpoint - 문제별 정답률 통계
  app.get("/api/admin/question-stats", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      const questionStats = [];

      for (const question of questions) {
        const responses = await storage.getResponsesForQuestion(question.id);
        const totalAttempts = responses.length;
        const correctAttempts = responses.filter(r => r.isCorrect).length;
        const accuracy = totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(1) : 0;

        questionStats.push({
          questionId: question.id,
          questionStem: question.stem.substring(0, 100) + (question.stem.length > 100 ? '...' : ''), // 100자까지만
          type: question.type,
          difficulty: question.difficulty,
          totalAttempts,
          correctAttempts,
          accuracy: parseFloat(accuracy as string),
        });
      }

      // 정답률 낮은 순으로 정렬
      questionStats.sort((a, b) => a.accuracy - b.accuracy);

      res.json(questionStats);
    } catch (error) {
      console.error('Question stats error:', error);
      res.status(500).json({ message: "문제 통계 조회 중 오류가 발생했습니다." });
    }
  });

  // Question detail statistics endpoint - 문제 상세 분석
  app.get("/api/admin/question-details/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const detailStats = await storage.getQuestionDetailStats(questionId);
      
      if (!detailStats) {
        return res.status(404).json({ message: "문제를 찾을 수 없습니다." });
      }

      res.json({
        success: true,
        data: detailStats
      });
    } catch (error) {
      console.error('Question detail stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: "문제 상세 분석 중 오류가 발생했습니다." 
      });
    }
  });

  // 어려운 문제 TOP 20 가져오기
  app.get("/api/questions/difficult-top20", async (req, res) => {
    try {
      const questions = await storage.getQuestions(); // 모든 문제 대상 (기본 + 왕소희 문제)
      const questionStats = [];

      for (const question of questions) {
        const responses = await storage.getResponsesForQuestion(question.id);
        const totalAttempts = responses.length;
        
        // 최소 3번 이상 시도된 문제만 포함
        if (totalAttempts >= 3) {
          const correctAttempts = responses.filter(r => r.isCorrect).length;
          const accuracy = (correctAttempts / totalAttempts) * 100;

          questionStats.push({
            question,
            accuracy,
            totalAttempts,
          });
        }
      }

      // 정답률 낮은 순으로 정렬하고 상위 20개만 선택
      questionStats.sort((a, b) => a.accuracy - b.accuracy);
      const difficultQuestions = questionStats.slice(0, 20).map(stat => stat.question);

      res.json({ questions: difficultQuestions, count: difficultQuestions.length });
    } catch (error) {
      console.error('Difficult questions error:', error);
      res.status(500).json({ message: "어려운 문제 조회 중 오류가 발생했습니다." });
    }
  });

  // Detailed analytics endpoint
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      // Get detailed page view analytics
      const pageViewsQuery = `
        SELECT 
          DATE(visited_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') as visit_date,
          COUNT(DISTINCT ip_address) as unique_visitors,
          COUNT(*) as total_views
        FROM page_views 
        GROUP BY DATE(visited_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul')
        ORDER BY visit_date DESC
        LIMIT 30
      `;
      
      // Get session and response analytics
      const sessionQuery = `
        SELECT 
          COUNT(DISTINCT sessions.id) as total_sessions,
          COUNT(DISTINCT responses.session_id) as sessions_with_responses,
          COUNT(responses.id) as total_answers,
          COUNT(CASE WHEN responses.is_correct = true THEN 1 END) as correct_answers
        FROM sessions 
        LEFT JOIN responses ON sessions.id = responses.session_id
      `;

      const overallQuery = `
        SELECT 
          (SELECT COUNT(DISTINCT ip_address) FROM page_views) as total_unique_visitors,
          (SELECT COUNT(*) FROM page_views) as total_page_views,
          (SELECT COUNT(*) FROM questions) as total_questions,
          (SELECT MIN(visited_at) FROM page_views) as first_visit,
          (SELECT MAX(visited_at) FROM page_views) as last_visit
      `;

      // Execute queries using storage interface or direct db access
      // For now, return basic stats that we can get from storage
      const basicStats = {
        todayViews: await storage.getTodayPageViews(),
        totalViews: await storage.getTotalPageViews(),
        todayUniqueVisitors: await storage.getTodayUniqueVisitors(),
        totalUniqueVisitors: await storage.getTotalUniqueVisitors()
      };

      res.json({
        ...basicStats,
        message: "상세 분석 데이터는 데이터베이스 직접 쿼리가 필요합니다."
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "분석 데이터 조회 중 오류가 발생했습니다." });
    }
  });

  // IP별 방문자 통계 조회 API
  app.get("/api/admin/visitor-stats", async (req, res) => {
    try {
      const { sortBy } = req.query;
      const sortOption = sortBy === 'lastVisit' ? 'lastVisit' : 'visitCount';
      
      const visitorStats = await storage.getVisitorStatsByIP(sortOption);
      
      res.json({
        visitors: visitorStats,
        totalIPs: visitorStats.length,
        sortBy: sortOption,
        message: "IP별 방문자 통계를 성공적으로 조회했습니다."
      });
    } catch (error) {
      console.error('Visitor stats error:', error);
      res.status(500).json({ message: "방문자 통계 조회 중 오류가 발생했습니다." });
    }
  });

  // Start a new session and return first question
  app.post("/api/session/start", async (req, res) => {
    try {
      const { mode = "study", questionCount, difficulty, subject, employeeId } = req.body;

      const session = await storage.createSession({ mode, employeeId: employeeId || null });

      // Get questions based on mode
      let questions;
      if (mode === "wangsohee" || mode === "wangsohee-timer") {
        questions = await storage.getQuestionsByAuthor("wangsohee");
      } else if (mode === "difficult") {
        // For difficult mode, get ALL questions (not just default)
        questions = await storage.getQuestions();
      } else if (mode === "wrong") {
        if (!employeeId) {
          return res.status(400).json({ message: "로그인이 필요한 기능입니다." });
        }
        const wrongIds = await getWrongQuestionIdsForEmployee(employeeId);
        questions = (await Promise.all(wrongIds.map(id => storage.getQuestion(id))))
          .filter((q): q is Question => !!q);
      } else if (mode === "bookmarked") {
        if (!employeeId) {
          return res.status(400).json({ message: "로그인이 필요한 기능입니다." });
        }
        const employeeBookmarks = await storage.getBookmarksForEmployee(employeeId);
        questions = (await Promise.all(employeeBookmarks.map(b => storage.getQuestion(b.questionId))))
          .filter((q): q is Question => !!q);
      } else {
        // Only get default questions for regular study modes
        questions = await storage.getQuestionsByAuthor("default");
      }

      if (questions.length === 0) {
        if (mode === "wangsohee" || mode === "wangsohee-timer") {
          return res.status(404).json({ message: "아직 왕소희 제작 문제가 없습니다." });
        }
        if (mode === "wrong") {
          return res.status(404).json({ message: "틀린 문제가 없습니다! 완벽해요 🎉" });
        }
        if (mode === "bookmarked") {
          return res.status(404).json({ message: "북마크한 문제가 없습니다." });
        }
        return res.status(404).json({ message: "No questions available" });
      }

      // 과목 필터 (전체 조회가 필요한 어려운 문제 모드는 제외)
      if (subject && subject !== "all" && mode !== "difficult") {
        questions = questions.filter(q => q.subject === subject);
        if (questions.length === 0) {
          return res.status(404).json({ message: "해당 과목에는 아직 문제가 없습니다." });
        }
      }

      // Special handling for difficult mode
      if (mode === "difficult") {
        const questionStats = [];
        
        for (const question of questions) {
          const responses = await storage.getResponsesForQuestion(question.id);
          const totalAttempts = responses.length;
          
          // Only include questions with at least 3 attempts
          if (totalAttempts >= 3) {
            const correctAttempts = responses.filter(r => r.isCorrect).length;
            const accuracy = (correctAttempts / totalAttempts) * 100;

            questionStats.push({
              question,
              accuracy,
              totalAttempts,
            });
          }
        }

        // Sort by accuracy (lowest first) and take top 20
        questionStats.sort((a, b) => a.accuracy - b.accuracy);
        questions = questionStats.slice(0, 20).map(stat => stat.question);

        if (questions.length === 0) {
          return res.status(404).json({ message: "Not enough data for difficult questions mode" });
        }
      } else {
        // Filter by difficulty if specified (only for non-difficult modes)
        if (difficulty && difficulty >= 1 && difficulty <= 3) {
          questions = questions.filter(q => q.difficulty === difficulty);
          if (questions.length === 0) {
            return res.status(404).json({ message: `No questions available for difficulty ${difficulty}` });
          }
        }
      }

      // Always shuffle questions for randomized order
      questions = shuffle(questions);
      
      // If questionCount is specified, select only that many questions (except for difficult mode)
      if (questionCount && questionCount > 0 && mode !== "difficult") {
        questions = questions.slice(0, Math.min(questionCount, questions.length));
      }

      // Store the question order for this session
      sessionQuestionOrders.set(session.id, questions.map(q => q.id));

      const firstQuestion = questions[0];
      let questionWithChoices: QuestionWithChoices = firstQuestion;

      if (firstQuestion.type === "MCQ") {
        const choices = await storage.getChoicesForQuestion(firstQuestion.id);
        questionWithChoices = {
          ...firstQuestion,
          choices: shuffle(choices), // Randomize choice order
        };
      }

      const response: SessionResponse = {
        sessionId: session.id,
        question: questionWithChoices,
        currentQuestion: 1,
        totalQuestions: questions.length,
      };

      res.json(response);
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({ message: "Failed to start session" });
    }
  });

  // Get next question in session
  app.get("/api/session/:id/next", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const responses = await storage.getResponsesForSession(sessionId);
      const currentQuestionIndex = responses.length;
      
      // Get the question order for this session
      const questionOrder = sessionQuestionOrders.get(sessionId);
      if (!questionOrder || currentQuestionIndex >= questionOrder.length) {
        return res.status(404).json({ message: "No more questions" });
      }

      const nextQuestionId = questionOrder[currentQuestionIndex];
      const nextQuestion = await storage.getQuestion(nextQuestionId);
      
      if (!nextQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }

      let questionWithChoices: QuestionWithChoices = nextQuestion;

      if (nextQuestion.type === "MCQ") {
        const choices = await storage.getChoicesForQuestion(nextQuestion.id);
        questionWithChoices = {
          ...nextQuestion,
          choices: shuffle(choices), // Randomize choice order
        };
      }

      const response: SessionResponse = {
        sessionId: session.id,
        question: questionWithChoices,
        currentQuestion: currentQuestionIndex + 1,
        totalQuestions: questionOrder.length,
      };

      res.json(response);
    } catch (error) {
      console.error("Error getting next question:", error);
      res.status(500).json({ message: "Failed to get next question" });
    }
  });

  // Submit answer for current question
  app.post("/api/session/:id/answer", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const responses = await storage.getResponsesForSession(sessionId);
      const currentQuestionIndex = responses.length;

      // Get the question order for this session
      const questionOrder = sessionQuestionOrders.get(sessionId);
      if (!questionOrder || currentQuestionIndex >= questionOrder.length) {
        return res.status(400).json({ message: "No active question to answer" });
      }

      const currentQuestionId = questionOrder[currentQuestionIndex];
      const currentQuestion = await storage.getQuestion(currentQuestionId);
      
      if (!currentQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      let isCorrect = false;

      if (currentQuestion.type === "MCQ") {
        const { selectedChoiceId } = req.body;
        
        // Handle empty answer (time out) - mark as incorrect
        if (!selectedChoiceId) {
          isCorrect = false;
          await storage.createResponse({
            sessionId,
            questionId: currentQuestion.id,
            choiceId: null,
            selectedBoolean: null,
            isCorrect: false,
          });
        } else {
          const choices = await storage.getChoicesForQuestion(currentQuestion.id);
          const selectedChoice = choices.find(c => c.id === selectedChoiceId);
          
          if (!selectedChoice) {
            return res.status(400).json({ message: "Invalid choice ID" });
          }

          isCorrect = selectedChoice.isCorrect;

          await storage.createResponse({
            sessionId,
            questionId: currentQuestion.id,
            choiceId: selectedChoiceId,
            selectedBoolean: null,
            isCorrect,
          });
        }
      } else if (currentQuestion.type === "OX") {
        const { selectedBoolean } = req.body;
        
        // Handle empty answer (time out) - mark as incorrect  
        if (typeof selectedBoolean !== "boolean") {
          isCorrect = false;
          await storage.createResponse({
            sessionId,
            questionId: currentQuestion.id,
            choiceId: null,
            selectedBoolean: null,
            isCorrect: false,
          });
        } else {
          isCorrect = selectedBoolean === currentQuestion.answer;

          await storage.createResponse({
            sessionId,
            questionId: currentQuestion.id,
            choiceId: null,
            selectedBoolean,
            isCorrect,
          });
        }
      }

      const response: AnswerResponse = {
        isCorrect,
        explanation: currentQuestion.explanation || "",
        nextReady: true,
      };

      res.json(response);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Finish session and get results
  app.post("/api/session/:id/finish", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      await storage.endSession(sessionId);

      const responses = await storage.getResponsesForSession(sessionId);
      
      // Get the actual number of questions for this session
      const sessionQuestionOrder = sessionQuestionOrders.get(sessionId);
      const actualTotalQuestions = sessionQuestionOrder ? sessionQuestionOrder.length : responses.length;

      const correctAnswers = responses.filter(r => r.isCorrect).length;
      const incorrectAnswers = responses.length - correctAnswers;

      const questionResults = [];
      for (const response of responses) {
        const question = await storage.getQuestion(response.questionId);
        if (question) {
          let questionWithChoices: QuestionWithChoices = question;
          if (question.type === "MCQ") {
            const choices = await storage.getChoicesForQuestion(question.id);
            questionWithChoices = { ...question, choices };
          }

          const userAnswer = response.choiceId || response.selectedBoolean || "";
          questionResults.push({
            question: questionWithChoices,
            userAnswer,
            isCorrect: response.isCorrect,
          });
        }
      }

      const results: ResultsResponse = {
        totalQuestions: actualTotalQuestions,
        correctAnswers,
        incorrectAnswers,
        questions: questionResults,
      };

      res.json(results);
    } catch (error) {
      console.error("Error finishing session:", error);
      res.status(500).json({ message: "Failed to finish session" });
    }
  });

  // 관리자 API - 문제 등록
  app.post("/api/admin/questions", async (req, res) => {
    try {
      const { type, questionId, stem, explanation, tags, subject, difficulty, source, answer, choices, author } = req.body;

      if (!type || !questionId || !stem || !explanation) {
        return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
      }

      // 문제 생성
      const question = await storage.createQuestion({
        id: questionId,
        type,
        stem,
        explanation,
        tags: tags || null,
        subject: subject || null,
        difficulty: difficulty || null,
        source: source || null,
        answer: type === "OX" ? answer : null,
        author: author || "default",
      });

      // 사지선다인 경우 선택지 생성
      if (type === "MCQ" && choices && Array.isArray(choices)) {
        for (let i = 0; i < choices.length; i++) {
          const choice = choices[i];
          await storage.createChoice({
            id: `${questionId}c${i + 1}`,
            questionId: questionId,
            content: choice.content,
            isCorrect: choice.isCorrect,
          });
        }
      }

      res.json({ message: "문제가 성공적으로 등록되었습니다.", question });
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "문제 등록에 실패했습니다." });
    }
  });

  // 관리자 API - 일괄 문제 등록
  app.post("/api/admin/questions/bulk", async (req, res) => {
    try {
      const { questions } = req.body;

      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "문제 목록이 필요합니다." });
      }

      const results = [];

      for (const questionData of questions) {
        const { type, questionId, stem, explanation, tags, subject, difficulty, source, answer, choices, author } = questionData;

        if (!type || !questionId || !stem || !explanation) {
          results.push({ questionId, success: false, error: "필수 필드 누락" });
          continue;
        }

        try {
          // 문제 생성
          const question = await storage.createQuestion({
            id: questionId,
            type,
            stem,
            explanation,
            tags: tags || null,
            subject: subject || null,
            difficulty: difficulty || null,
            source: source || null,
            answer: type === "OX" ? answer : null,
            author: author || "default",
          });

          // 사지선다인 경우 선택지 생성
          if (type === "MCQ" && choices && Array.isArray(choices)) {
            for (let i = 0; i < choices.length; i++) {
              const choice = choices[i];
              await storage.createChoice({
                id: `${questionId}c${i + 1}`,
                questionId: questionId,
                content: choice.content,
                isCorrect: choice.isCorrect,
              });
            }
          }

          results.push({ questionId, success: true });
        } catch (error) {
          results.push({ questionId, success: false, error: error instanceof Error ? error.message : "알 수 없는 오류" });
        }
      }

      res.json({ message: "일괄 등록이 완료되었습니다.", results });
    } catch (error) {
      console.error("Error bulk creating questions:", error);
      res.status(500).json({ message: "일괄 등록에 실패했습니다." });
    }
  });

  // 관리자 API - CSV 파일 업로드
  app.post("/api/admin/questions/csv", upload.single("csv"), async (req, res) => {
    try {
      console.log('CSV 업로드 요청 받음. 파일:', req.file ? `크기 ${req.file.size}바이트` : '없음');
      
      if (!req.file) {
        console.error('CSV 파일이 업로드되지 않음');
        return res.status(400).json({ message: "CSV 파일이 필요합니다." });
      }

      const results: any[] = [];
      const csvData: any[] = [];
      
      // BOM 제거 및 문자열 정리
      let csvText = req.file.buffer.toString('utf8');
      
      // UTF-8 BOM 제거
      if (csvText.charCodeAt(0) === 0xFEFF) {
        csvText = csvText.slice(1);
      }
      
      const csvBuffer = Buffer.from(csvText, 'utf8');

      // CSV 파일을 스트림으로 처리
      const readable = new Readable();
      readable.push(csvBuffer);
      readable.push(null);

      readable
        .pipe(csv())
        .on("data", (row) => {
          csvData.push(row);
        })
        .on("end", async () => {
          try {
            for (let i = 0; i < csvData.length; i++) {
              const row = csvData[i];
              
              // 첫 번째 키부터 question_id 찾기 (BOM 문제 해결)
              const allKeys = Object.keys(row);
              const qIdKey = allKeys.find(key => key.endsWith('question_id')) || allKeys[0];
              
              const questionId = row[qIdKey] || row.questionId || row["문제ID"];
              const stem = row.stem || row["문제내용"];
              const explanation = row.explanation || row["해설"];
              const tags = row.tags || row["태그"] || null;
              const subject = row.subject || row["과목"] || null;
              const difficulty = (row.difficulty || row["난이도"]) ? parseInt(row.difficulty || row["난이도"]) : null;
              const source = row.source || row["출처"] || null;

              if (!questionId || !stem || !explanation) {
                const missingFields = [];
                if (!questionId) missingFields.push('question_id');
                if (!stem) missingFields.push('stem');
                if (!explanation) missingFields.push('explanation');
                
                results.push({ 
                  questionId: questionId || "unknown", 
                  success: false, 
                  error: `필수 필드 누락: ${missingFields.join(', ')}` 
                });
                continue;
              }

              try {
                // 영어와 한국어 필드 모두 지원 (영어 우선)
                const answer = row.answer || row["정답"];
                const choice1 = row.choice1 || row["선택지1"];
                const choice2 = row.choice2 || row["선택지2"];
                const choice3 = row.choice3 || row["선택지3"];
                const choice4 = row.choice4 || row["선택지4"];
                const correctAnswer = parseInt(row.correct_answer || row.correctAnswer || row["정답번호"]);
                
                // OX 문제인지 사지선다인지 판단
                const hasAnswer = answer && answer.trim() !== "";
                const hasChoices = choice1 && choice1.trim() !== "" && 
                                  choice2 && choice2.trim() !== "" && 
                                  choice3 && choice3.trim() !== "" && 
                                  choice4 && choice4.trim() !== "";
                const isOX = hasAnswer && (answer.toUpperCase() === "O" || answer.toUpperCase() === "X" || 
                             answer === "true" || answer === "false");
                
                if (isOX) {
                  // OX 문제 처리
                  const answerBoolean = answer.toUpperCase() === "O" || answer === "true";
                  
                  await storage.createQuestion({
                    id: questionId,
                    type: "OX",
                    stem,
                    explanation,
                    tags,
                    subject,
                    difficulty,
                    source,
                    answer: answerBoolean,
                  });
                } else if (hasChoices) {
                  // 사지선다 문제 처리
                  if (!choice1 || !choice2 || !choice3 || !choice4 || !correctAnswer) {
                    results.push({ questionId, success: false, error: "선택지 또는 정답 번호가 누락됨" });
                    continue;
                  }

                  // 문제 생성
                  await storage.createQuestion({
                    id: questionId,
                    type: "MCQ",
                    stem,
                    explanation,
                    tags,
                    subject,
                    difficulty,
                    source,
                    answer: null,
                  });

                  // 선택지 생성
                  const choicesArray = [choice1, choice2, choice3, choice4];
                  for (let i = 0; i < choicesArray.length; i++) {
                    await storage.createChoice({
                      id: `${questionId}c${i + 1}`,
                      questionId: questionId,
                      content: choicesArray[i],
                      isCorrect: (i + 1) === correctAnswer,
                    });
                  }
                } else {
                  // OX도 MCQ도 아닌 경우
                  results.push({ 
                    questionId, 
                    success: false, 
                    error: "문제 타입을 결정할 수 없음 (OX 문제는 answer 필드가, 사지선다는 choice1~4와 correct_answer 필드가 필요)" 
                  });
                  continue;
                }

                results.push({ questionId, success: true });
              } catch (error) {
                results.push({ 
                  questionId, 
                  success: false, 
                  error: error instanceof Error ? error.message : "알 수 없는 오류" 
                });
              }
            }

            const successCount = results.filter(r => r.success).length;
            const failedResults = results.filter(r => !r.success);
            
            res.json({ 
              message: `CSV 파일 처리 완료. 총 ${csvData.length}개 문제 중 ${successCount}개 성공`,
              results,
              errors: failedResults.length > 0 ? failedResults.slice(0, 5) : [] // 처음 5개 에러만 표시
            });
          } catch (error) {
            console.error("CSV 데이터 처리 중 심각한 오류:", error);
            res.status(500).json({ 
              message: "CSV 데이터 처리 중 오류가 발생했습니다.",
              error: error instanceof Error ? error.message : String(error)
            });
          }
        })
        .on("error", (error) => {
          console.error("CSV 파싱 오류:", error);
          res.status(500).json({ 
            message: "CSV 파일 파싱 중 오류가 발생했습니다.",
            error: error instanceof Error ? error.message : String(error)
          });
        });

    } catch (error) {
      console.error("CSV 업로드 전체 처리 오류:", error);
      res.status(500).json({ 
        message: "CSV 업로드에 실패했습니다.",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // 관리자 API - 개별 문제 수정
  app.put("/api/admin/questions/:id", async (req, res) => {
    try {
      const questionId = req.params.id;
      
      // 문제가 존재하는지 확인
      const existingQuestion = await storage.getQuestion(questionId);
      if (!existingQuestion) {
        return res.status(404).json({ message: "문제를 찾을 수 없습니다." });
      }

      // 요청 데이터 검증
      const { question, choices } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "문제 데이터가 필요합니다." });
      }

      // 문제 업데이트
      const updatedQuestion = await storage.updateQuestion(questionId, question);

      // MCQ 문제의 경우 선택지도 업데이트
      if (question.type === "MCQ" && choices && Array.isArray(choices)) {
        await storage.updateChoicesForQuestion(questionId, choices);
      }
      
      res.json({ 
        message: "문제가 성공적으로 수정되었습니다.",
        question: updatedQuestion
      });
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "문제 수정에 실패했습니다." });
    }
  });

  // 관리자 API - 개별 문제 삭제
  app.delete("/api/admin/questions/:id", async (req, res) => {
    try {
      const questionId = req.params.id;
      
      // 문제가 존재하는지 확인
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "문제를 찾을 수 없습니다." });
      }

      // 문제와 관련된 선택지, 응답 모두 삭제
      await storage.deleteQuestion(questionId);
      
      res.json({ message: "문제가 성공적으로 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "문제 삭제에 실패했습니다." });
    }
  });

  // 관리자 API - 모든 데이터 삭제 (위험한 기능)
  app.delete("/api/admin/questions/clear", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ message: "모든 문제와 선택지가 삭제되었습니다." });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({ message: "데이터 삭제에 실패했습니다." });
    }
  });

  // 관리자 API - CSV 다운로드
  app.get("/api/admin/questions/download", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      
      if (questions.length === 0) {
        return res.status(404).json({ message: "다운로드할 문제가 없습니다." });
      }

      // CSV 헤더 설정
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="kb_exam_questions.csv"');
      
      // CSV 헤더 (BOM 제거)
      const header = 'question_id,type,stem,explanation,tags,subject,difficulty,source,answer,choice1,choice2,choice3,choice4,correct_answer\n';
      res.write(header);

      // 각 문제를 CSV 형식으로 변환
      for (const question of questions) {
        let csvRow = '';
        
        // 기본 정보
        csvRow += `"${question.id}",`;
        csvRow += `"${question.type}",`;
        csvRow += `"${question.stem.replace(/"/g, '""')}",`;
        csvRow += `"${question.explanation?.replace(/"/g, '""') || ''}",`;
        csvRow += `"${question.tags || ''}",`;
        csvRow += `"${question.subject || ''}",`;
        csvRow += `"${question.difficulty || ''}",`;
        csvRow += `"${question.source || ''}",`;

        if (question.type === "OX") {
          // OX 문제
          csvRow += `"${question.answer ? 'O' : 'X'}",`;
          csvRow += ',"","","",""'; // 빈 선택지들
        } else {
          // MCQ 문제
          csvRow += '"",'; // 빈 answer
          
          const choices = await storage.getChoicesForQuestion(question.id);
          const sortedChoices = choices.sort((a, b) => a.id.localeCompare(b.id));
          
          // 선택지 4개
          for (let i = 0; i < 4; i++) {
            if (i < sortedChoices.length) {
              csvRow += `"${sortedChoices[i].content.replace(/"/g, '""')}",`;
            } else {
              csvRow += '"",';
            }
          }
          
          // 정답 번호 찾기
          const correctChoiceIndex = sortedChoices.findIndex(choice => choice.isCorrect);
          csvRow += `"${correctChoiceIndex + 1}"`;
        }
        
        res.write(csvRow + '\n');
      }
      
      res.end();
    } catch (error) {
      console.error("Error downloading CSV:", error);
      res.status(500).json({ message: "CSV 다운로드에 실패했습니다." });
    }
  });

  // Comment endpoints
  app.post("/api/comments", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
      }

      if (content.length > 500) {
        return res.status(400).json({ message: "댓글은 500자 이하로 작성해주세요." });
      }

      // IP 주소 추출
      const realIP = req.get('X-Real-IP') || 
                    req.get('X-Forwarded-For')?.split(',')[0] || 
                    req.ip || 
                    req.connection.remoteAddress || 
                    'unknown';

      const commentData = {
        content: content.trim(),
        ipAddress: realIP,
        userAgent: req.get('User-Agent') || null
      };

      const newComment = await storage.createComment(commentData);
      
      res.json({
        success: true,
        comment: newComment,
        message: "댓글이 성공적으로 등록되었습니다."
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "댓글 등록에 실패했습니다." });
    }
  });

  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getAllComments();
      
      res.json({
        success: true,
        comments: comments,
        total: comments.length
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "댓글을 불러오는데 실패했습니다." });
    }
  });

  // 관리자용 댓글 삭제 API
  app.delete("/api/admin/comments/:id", async (req, res) => {
    try {
      const commentId = req.params.id;
      
      if (!commentId) {
        return res.status(400).json({ message: "댓글 ID가 필요합니다." });
      }

      await storage.deleteComment(commentId);
      
      res.json({
        success: true,
        message: "댓글이 성공적으로 삭제되었습니다."
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "댓글 삭제에 실패했습니다." });
    }
  });

  // 관리자 페이지뷰 통계 API
  app.get("/api/admin/page-views", async (req, res) => {
    try {
      const totalPageViews = await storage.getTotalPageViews();
      const todayPageViews = await storage.getTodayPageViews();
      const totalUniqueVisitors = await storage.getTotalUniqueVisitors();
      const todayUniqueVisitors = await storage.getTodayUniqueVisitors();
      const visitorStats = await storage.getVisitorStatsByIP();

      res.status(200).json({
        success: true,
        data: {
          totalPageViews,
          todayPageViews,
          totalUniqueVisitors,
          todayUniqueVisitors,
          visitorStats
        }
      });
    } catch (error) {
      console.error("페이지뷰 통계 조회 에러:", error);
      res.status(500).json({ message: "페이지뷰 통계 조회에 실패했습니다." });
    }
  });

  // 관리자 일별 방문 통계 API
  app.get("/api/admin/daily-stats", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 5;
      const dailyStats = await storage.getDailyVisitStats(days);

      res.status(200).json({
        success: true,
        data: dailyStats
      });
    } catch (error) {
      console.error("일별 통계 조회 에러:", error);
      res.status(500).json({ 
        success: false, 
        message: "일별 통계 조회에 실패했습니다.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Page view tracking middleware (after all API routes)
  app.use(async (req, res, next) => {
    // 정적 파일과 API 경로는 제외
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
      try {
        const realIP = req.get('X-Real-IP') || 
                      req.get('X-Forwarded-For')?.split(',')[0] || 
                      req.ip || 
                      req.connection.remoteAddress || 
                      'unknown';
        
        const pageViewData = {
          ipAddress: realIP,
          userAgent: req.get('User-Agent') || '',
          page: req.path
        };
        
        console.log('📊 페이지뷰 기록:', {
          path: req.path,
          ip: realIP,
          userAgent: req.get('User-Agent'),
          headers: {
            'X-Real-IP': req.get('X-Real-IP'),
            'X-Forwarded-For': req.get('X-Forwarded-For')
          }
        });
        
        await storage.recordPageView(pageViewData);
      } catch (error) {
        console.error('페이지 조회수 기록 실패:', error);
      }
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
