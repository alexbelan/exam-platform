import { defineStore } from "pinia";
import { storage } from "@shared/utils";
import type { TestSessionState, SerializedSession } from "../model/types";

const STORAGE_KEY = "test-session";

export const useTestSessionStore = defineStore("testSession", {
  state: (): TestSessionState => ({
    testId: null,
    questionIds: [],
    currentQuestionIndex: 0,
    userAnswers: new Map(),
    startedAt: null,
    loadedQuestions: new Map(),
  }),

  getters: {
    hasActiveSession: (state) => {
      return state.testId !== null && state.questionIds.length > 0;
    },

    currentQuestionId: (state) => {
      if (state.currentQuestionIndex >= state.questionIds.length) {
        return null;
      }
      return state.questionIds[state.currentQuestionIndex];
    },

    totalQuestions: (state) => state.questionIds.length,

    getAnswersForQuestion: (state) => {
      return (questionId: number): Set<number> => {
        return state.userAnswers.get(questionId) || new Set();
      };
    },
  },

  actions: {
    // Инициализация теста - проверяем сохраненную сессию или загружаем новый
    async initializeTest(
      testId: number | string
    ): Promise<{ restored: boolean }> {
      const id = Number(testId);

      // Проверяем, есть ли сохраненная сессия для этого теста
      const savedSession = this.loadFromStorage();

      if (
        savedSession &&
        savedSession.testId === id &&
        savedSession.questionIds.length > 0
      ) {
        // Восстанавливаем из сохраненного состояния
        const userAnswersMap = new Map<number, Set<number>>();
        if (savedSession.userAnswers) {
          Object.entries(savedSession.userAnswers).forEach(([k, v]) => {
            userAnswersMap.set(Number(k), new Set(v as number[]));
          });
        }

        const loadedQuestionsMap = new Map<number, any>();
        if (savedSession.loadedQuestions) {
          Object.entries(savedSession.loadedQuestions).forEach(([k, v]) => {
            loadedQuestionsMap.set(Number(k), v);
          });
        }

        this.$patch({
          testId: savedSession.testId,
          questionIds: savedSession.questionIds,
          currentQuestionIndex: savedSession.currentQuestionIndex || 0,
          userAnswers: userAnswersMap,
          startedAt: savedSession.startedAt,
          loadedQuestions: loadedQuestionsMap,
        });
        return { restored: true };
      }

      this.testId = id;
      this.questionIds = [];
      this.currentQuestionIndex = 0;
      this.userAnswers = new Map();
      this.startedAt = null;
      this.loadedQuestions = new Map();
      this.saveToStorage();

      return { restored: false };
    },

    // Загрузить данные теста (метаданные) - не используется в store, только для справки
    // Метаданные получаются через API в компонентах

    // Сгенерировать вопросы для теста (сохраняем только ID)
    setQuestionIds(questionIds: number[]) {
      this.questionIds = questionIds;
      // Если восстанавливаем сессию, не сбрасываем currentQuestionIndex
      // Если новый тест - сбрасываем
      if (this.currentQuestionIndex >= questionIds.length) {
        this.currentQuestionIndex = 0;
      }
      this.saveToStorage();
    },

    // Начать тест
    startTest() {
      if (this.questionIds.length === 0) {
        throw new Error("Вопросы не сгенерированы");
      }
      this.currentQuestionIndex = 0;
      this.userAnswers = new Map();
      this.startedAt = Date.now();
      this.saveToStorage();
    },

    // Сохранить ответ пользователя
    saveAnswer(questionId: number, answerIds: Set<number>) {
      this.userAnswers.set(questionId, new Set(answerIds));
      this.saveToStorage();
    },

    // Перейти к следующему вопросу
    goToNextQuestion() {
      if (this.currentQuestionIndex < this.questionIds.length - 1) {
        this.currentQuestionIndex++;
        this.saveToStorage();
      }
    },

    // Перейти к предыдущему вопросу
    goToPreviousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.saveToStorage();
      }
    },

    // Перейти к конкретному вопросу по индексу
    goToQuestion(index: number) {
      if (index >= 0 && index < this.questionIds.length) {
        this.currentQuestionIndex = index;
        this.saveToStorage();
      }
    },

    // Сохранить загруженный вопрос в кэш
    cacheQuestion(questionId: number, question: any) {
      this.loadedQuestions.set(questionId, question);
      this.saveToStorage();
    },

    // Получить загруженный вопрос из кэша
    getCachedQuestion(questionId: number): any | undefined {
      return this.loadedQuestions.get(questionId);
    },

    // Выход из теста с очисткой
    exitTest() {
      this.clearSession();
    },

    // Очистить сессию
    clearSession() {
      this.$reset();
      storage.remove(STORAGE_KEY);
    },

    // Сохранить в localStorage
    saveToStorage() {
      if (typeof window === "undefined") return;

      const userAnswersRecord: Record<string, number[]> = {};
      this.userAnswers.forEach((answerIds, questionId) => {
        userAnswersRecord[questionId.toString()] = Array.from(answerIds);
      });

      const loadedQuestionsRecord: Record<string, any> = {};
      this.loadedQuestions.forEach((question, questionId) => {
        loadedQuestionsRecord[questionId.toString()] = question;
      });

      const serialized: SerializedSession = {
        testId: this.testId,
        questionIds: this.questionIds,
        currentQuestionIndex: this.currentQuestionIndex,
        userAnswers: userAnswersRecord,
        startedAt: this.startedAt,
        loadedQuestions: loadedQuestionsRecord,
      };

      storage.set(STORAGE_KEY, serialized);
    },

    // Загрузить из localStorage
    loadFromStorage(): SerializedSession | null {
      const data = storage.get<SerializedSession>(STORAGE_KEY);
      return data;
    },
  },
});
