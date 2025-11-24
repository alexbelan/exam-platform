import { defineStore } from "pinia";
import type { ProfileState, ProfileContentFilter } from "../model/types";

export const useProfileStateStore = defineStore("profileState", {
  state: (): ProfileState => ({
    // По умолчанию избранные вопросы
    activeFilter: "favorite-questions",

    // Данные (кеш)
    statistics: null,
    favoriteQuestions: [],
    favoriteTests: [],
    incorrectAnswers: [],

    // Метаданные для кеширования
    lastFetch: {
      statistics: null,
      favoriteQuestions: null,
      favoriteTests: null,
      incorrectAnswers: null,
    },
  }),

  getters: {
    hasStatistics: (state) => state.statistics !== null,
    hasFavoriteQuestions: (state) => state.favoriteQuestions.length > 0,
    hasFavoriteTests: (state) => state.favoriteTests.length > 0,
    hasIncorrectAnswers: (state) => state.incorrectAnswers.length > 0,
  },

  actions: {
    setActiveFilter(filter: ProfileContentFilter) {
      this.activeFilter = filter;
      // Не сохраняем в localStorage
    },

    setStatistics(statistics: ProfileState["statistics"]) {
      this.statistics = statistics;
      this.lastFetch.statistics = Date.now();
    },

    setFavoriteQuestions(questions: any[]) {
      this.favoriteQuestions = questions;
      this.lastFetch.favoriteQuestions = Date.now();
    },

    setFavoriteTests(tests: any[]) {
      this.favoriteTests = tests;
      this.lastFetch.favoriteTests = Date.now();
    },

    setIncorrectAnswers(questions: any[]) {
      this.incorrectAnswers = questions;
      this.lastFetch.incorrectAnswers = Date.now();
    },

    clearCache() {
      this.statistics = null;
      this.favoriteQuestions = [];
      this.favoriteTests = [];
      this.incorrectAnswers = [];
      this.lastFetch = {
        statistics: null,
        favoriteQuestions: null,
        favoriteTests: null,
        incorrectAnswers: null,
      };
    },
  },
});

