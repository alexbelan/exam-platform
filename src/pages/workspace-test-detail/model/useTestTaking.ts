import { computed, ref, watch } from "vue";
import { useAsyncTestTaking } from "./useAsyncTestTaking";
import type { TestMetaResponse, TestGenerateResponse } from "./types";
import type { QuestionAnswer } from "#shared/types/api/question";
import type { TestTag } from "@features/test-preview";
import { useTestSessionStore } from "@entities/test-session-state";

type TestResponse = {
  success: boolean;
  test: TestMetaResponse["test"];
  questions: number[];
  message: string;
};

export function useTestTaking(testId: string | number) {
  const store = useTestSessionStore();
  const {
    getTestMeta,
    generateTestQuestions,
    getQuestion,
    updateUncorrectedQuestions,
    submitTestAttempt,
  } = useAsyncTestTaking(testId);

  // Инициализация теста - проверяем сохраненную сессию
  const {
    data: initResult,
    pending: initPending,
    error: initError,
  } = useAsyncData(
    `test-init-${testId}`,
    async () => {
      return await store.initializeTest(testId);
    },
    {
      immediate: true,
    },
  );

  // Загрузка метаданных теста
  const {
    data: testMetaData,
    pending: metaPending,
    error: metaError,
    refresh: refreshMeta,
  } = useAsyncData<TestMetaResponse>(
    `test-meta-${testId}`,
    async () => await getTestMeta(),
    {
      immediate: true,
    },
  );

  // Генерация вопросов
  const {
    data: testGenerateData,
    pending: generatePending,
    error: generateError,
    refresh: generateQuestions,
  } = useAsyncData<TestGenerateResponse>(
    `test-generate-${testId}`,
    async () => await generateTestQuestions(),
    {
      immediate: false, // Не генерируем сразу, только по запросу
    },
  );

  // Объединенные данные для совместимости
  const testData = computed<TestResponse | null>(() => {
    if (!testMetaData.value) return null;

    // Используем questionIds из store, если они есть, иначе из API
    const questions =
      store.questionIds.length > 0
        ? store.questionIds
        : testGenerateData.value?.questions || [];

    if (questions.length === 0) return null;

    return {
      success: true,
      test: testMetaData.value.test,
      questions,
      message: "Тест загружен",
    };
  });

  const pending = computed(
    () => initPending.value || metaPending.value || generatePending.value,
  );
  const error = computed(
    () => initError.value || metaError.value || generateError.value,
  );

  // Если есть сохраненная сессия, используем вопросы из store
  // Если нет - генерируем новые вопросы
  watch(
    [testMetaData, initResult],
    async ([metaData, init]) => {
      if (metaData && init) {
        // Если сессия восстановлена и есть вопросы в store - не генерируем
        if (init.restored && store.questionIds.length > 0) {
          return;
        }

        // Если нет сохраненной сессии или нет вопросов - генерируем
        if (!testGenerateData.value && !generatePending.value) {
          await generateQuestions();
        }
      }
    },
    { immediate: true },
  );

  // Сохраняем сгенерированные вопросы в store
  watch(testGenerateData, (generateData) => {
    if (generateData && generateData.questions.length > 0) {
      store.setQuestionIds(generateData.questions);
    }
  });

  // Состояние теста (используем store для позиции и ответов)
  const showResults = ref(false);
  const correctAnswers = ref(0);
  const incorrectAnswers = ref(0);

  // Детальные результаты для каждого вопроса
  interface QuestionResult {
    questionId: number;
    isCorrect: boolean;
    correctAnswerIds: Set<number>;
    userAnswerIds: Set<number>;
  }
  const questionResults = ref<Map<number, QuestionResult>>(new Map());

  // Computed для совместимости с существующим кодом
  const isTestStarted = computed({
    get: () => store.startedAt !== null,
    set: (value) => {
      if (value && !store.startedAt) {
        store.startTest();
      }
    },
  });

  const currentQuestionIndex = computed({
    get: () => store.currentQuestionIndex,
    set: (value) => {
      store.goToQuestion(value);
    },
  });

  const userAnswers = computed(() => store.userAnswers);

  // Объединяем primaryTag и tags в один массив для отображения
  const allTags = computed<TestTag[]>(() => {
    if (!testData.value) return [];

    const tags = [...testData.value.test.tags];
    if (testData.value.test.primaryTag) {
      // Проверяем, нет ли уже primaryTag в tags
      const hasPrimary = tags.some(
        (tag) => tag.id === testData.value!.test.primaryTag!.id,
      );
      if (!hasPrimary) {
        tags.unshift(testData.value.test.primaryTag);
      }
    }
    return tags;
  });

  // Получаем текущий questionId из store
  const currentQuestionId = computed(() => {
    return store.currentQuestionId;
  });

  // Локальное состояние для выбранных ответов текущего вопроса
  const selectedAnswers = ref<Set<number>>(new Set());

  // Восстанавливаем сохраненные ответы при изменении вопроса
  watch(
    currentQuestionId,
    (questionId) => {
      if (questionId) {
        const savedAnswers = store.getAnswersForQuestion(questionId);
        selectedAnswers.value = new Set(savedAnswers);
      } else {
        selectedAnswers.value = new Set();
      }
    },
    { immediate: true },
  );

  // Обработка изменения ответа
  const handleAnswerChange = (
    answerId: number,
    event: Event,
    questionId: number,
    questionType: "radio" | "checkbox",
  ) => {
    const target = event.target as HTMLInputElement;

    if (questionType === "radio") {
      // Для radio - только один выбранный ответ
      selectedAnswers.value = new Set(target.checked ? [answerId] : []);
    } else {
      // Для checkbox - несколько выбранных ответов
      const newSet = new Set(selectedAnswers.value);
      if (target.checked) {
        newSet.add(answerId);
      } else {
        newSet.delete(answerId);
      }
      selectedAnswers.value = newSet;
    }

    // Сохраняем ответы в store
    store.saveAnswer(questionId, selectedAnswers.value);
  };

  // Начало теста
  const startTest = () => {
    if (store.questionIds.length === 0) {
      return;
    }
    store.startTest();
    showResults.value = false;
    correctAnswers.value = 0;
    incorrectAnswers.value = 0;
    questionResults.value = new Map();
    // Восстанавливаем ответы для первого вопроса
    const firstQuestionId = store.currentQuestionId;
    if (firstQuestionId) {
      selectedAnswers.value = new Set(
        store.getAnswersForQuestion(firstQuestionId),
      );
    }
  };

  // Подсчет результатов
  const calculateResults = async () => {
    if (!testData.value || store.questionIds.length === 0) return;

    let correct = 0;
    let incorrect = 0;
    const results = new Map<number, QuestionResult>();

    // Загружаем все вопросы и сравниваем ответы
    for (const questionId of store.questionIds) {
      try {
        // Проверяем кэш в сторе
        let question = store.getCachedQuestion(questionId);

        if (!question) {
          // Загружаем только если нет в кэше
          const response = await getQuestion(questionId);
          question = response.question;
          // Сохраняем в кэш стора
          store.cacheQuestion(questionId, question);
        }

        // Получаем правильные ответы
        const correctAnswerIds = new Set<number>(
          question.questionAnswers
            .filter((qa: QuestionAnswer) => qa.isCorrect)
            .map((qa: QuestionAnswer) => qa.answer.id),
        );

        // Получаем ответы пользователя из store
        const userAnswerIds = store.getAnswersForQuestion(question.id);

        // Сравниваем множества
        const isCorrect =
          correctAnswerIds.size === userAnswerIds.size &&
          [...correctAnswerIds].every((id: number) => userAnswerIds.has(id)) &&
          [...userAnswerIds].every((id: number) => correctAnswerIds.has(id));

        // Сохраняем детальный результат
        results.set(question.id, {
          questionId: question.id,
          isCorrect,
          correctAnswerIds,
          userAnswerIds,
        });

        if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      } catch (err) {
        console.error(`Error loading question ${questionId}:`, err);
        incorrect++; // Считаем как неправильный, если не удалось загрузить
        results.set(questionId, {
          questionId,
          isCorrect: false,
          correctAnswerIds: new Set(),
          userAnswerIds: new Set(),
        });
      }
    }

    questionResults.value = results;
    correctAnswers.value = correct;
    incorrectAnswers.value = incorrect;
  };

  // Завершение теста
  const endTest = async () => {
    // Сохраняем ответы для текущего вопроса перед завершением
    const currentId = currentQuestionId.value;
    if (currentId) {
      store.saveAnswer(currentId, selectedAnswers.value);
    }

    try {
      await calculateResults();

      if (!testData.value) return;

      // Собираем данные для сохранения результатов
      const totalQuestions = testData.value.questions.length;
      const score = (correctAnswers.value / totalQuestions) * 100;
      const startedAtDate = store.startedAt
        ? new Date(store.startedAt)
        : new Date();
      const completedAt = new Date();
      const timeSpent = Math.floor(
        (completedAt.getTime() - startedAtDate.getTime()) / 1000,
      ); // в секундах

      // Формируем данные для сохранения
      const questionAnswers = Array.from(questionResults.value.entries()).map(
        ([questionId, result]) => ({
          questionId,
          userAnswerIds: Array.from(result.userAnswerIds),
          correctAnswerIds: Array.from(result.correctAnswerIds),
          isCorrect: result.isCorrect,
        }),
      );

      // Сохраняем результаты в БД
      try {
        await submitTestAttempt({
          testId: Number(testId),
          totalQuestions,
          correctAnswers: correctAnswers.value,
          score,
          timeSpent,
          startedAt: startedAtDate,
          completedAt,
          questionAnswers,
        });
      } catch (error) {
        console.error("Error saving test attempt:", error);
        // Не блокируем показ результатов, если сохранение не удалось
      }

      // Отправляем неправильные вопросы на сервер для обновления счетчика
      const incorrectQuestionIds = Array.from(questionResults.value.entries())
        .filter(([_, result]) => !result.isCorrect)
        .map(([questionId, _]) => questionId);

      if (incorrectQuestionIds.length > 0) {
        try {
          await updateUncorrectedQuestions(incorrectQuestionIds);
        } catch (error) {
          console.error("Error updating uncorrected questions count:", error);
          // Не блокируем показ результатов, если обновление не удалось
        }
      }

      // Сначала устанавливаем showResults, потом сбрасываем isTestStarted
      showResults.value = true;
      // Очищаем startedAt, но сохраняем ответы и позицию
      store.startedAt = null;
      store.saveToStorage();
    } catch (error) {
      console.error("Error calculating results:", error);
    }
  };

  // Перезапуск теста (без генерации новых вопросов)
  const restartTest = () => {
    // НЕ вызываем API для генерации новых вопросов
    // Используем те же вопросы из store
    showResults.value = false;
    store.startTest();
    correctAnswers.value = 0;
    incorrectAnswers.value = 0;
    questionResults.value = new Map();
    // Восстанавливаем ответы для первого вопроса
    const firstQuestionId = store.currentQuestionId;
    if (firstQuestionId) {
      selectedAnswers.value = new Set(
        store.getAnswersForQuestion(firstQuestionId),
      );
    }
  };

  // Переход к следующему вопросу
  const goToNextQuestion = () => {
    // Сохраняем ответы для текущего вопроса перед переходом
    const currentId = currentQuestionId.value;
    if (currentId) {
      store.saveAnswer(currentId, selectedAnswers.value);
    }

    store.goToNextQuestion();

    // Восстанавливаем ответы для нового вопроса
    const nextQuestionId = store.currentQuestionId;
    if (nextQuestionId) {
      selectedAnswers.value = new Set(
        store.getAnswersForQuestion(nextQuestionId),
      );
    }
  };

  // Переход к предыдущему вопросу
  const goToPreviousQuestion = () => {
    // Сохраняем ответы для текущего вопроса перед переходом
    const currentId = currentQuestionId.value;
    if (currentId) {
      store.saveAnswer(currentId, selectedAnswers.value);
    }

    store.goToPreviousQuestion();

    // Восстанавливаем ответы для предыдущего вопроса
    const prevQuestionId = store.currentQuestionId;
    if (prevQuestionId) {
      selectedAnswers.value = new Set(
        store.getAnswersForQuestion(prevQuestionId),
      );
    }
  };

  // Метод refresh для совместимости
  const refresh = async () => {
    await refreshMeta();
    await generateQuestions();
  };

  return {
    // Данные
    testData,
    pending,
    error,
    refresh,
    // Состояние
    isTestStarted,
    showResults,
    currentQuestionIndex,
    currentQuestionId,
    selectedAnswers,
    userAnswers,
    correctAnswers,
    incorrectAnswers,
    questionResults,
    // Computed
    allTags,
    // Методы
    handleAnswerChange,
    startTest,
    endTest,
    restartTest,
    goToNextQuestion,
    goToPreviousQuestion,
  };
}
