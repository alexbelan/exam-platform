.PHONY: help dev dev-d prod build build-prod clean clean-cache logs logs-prod shell db-shell install stop restart restart-prod status setup db-migrate db-generate db-studio db-seed db-seed-interview-questions clean-docker-cache clean-all

# Загружаем переменные из .env файла
-include .env
export

# Имя приложения из .env или значение по умолчанию
APP_NAME ?= test-platform

# Цвета для вывода
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help: ## Показать список доступных команд
	@echo "$(GREEN)Доступные команды:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'

install: ## Установить зависимости
	@echo "$(GREEN)Устанавливаем зависимости...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml run --rm app sh -lc "bun install --frozen-lockfile"

# ============================================
# Основные команды (Standalone режим)
# ============================================

dev: ## Запустить в режиме разработки
	@echo "$(GREEN)Запускаем standalone режим (development)...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml up --build

dev-d: ## Запустить в режиме разработки в фоне
	@echo "$(GREEN)Запускаем standalone режим в фоне (development)...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml up --build -d

prod: ## Запустить в production режиме
	@echo "$(GREEN)Запускаем standalone режим (production)...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.prod.yml up --build -d

build: ## Собрать образы для development
	@echo "$(GREEN)Собираем образы для development...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml build

build-prod: ## Собрать production образы
	@echo "$(GREEN)Собираем production образы...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.prod.yml build

stop: ## Остановить контейнеры
	@echo "$(YELLOW)Останавливаем контейнеры...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml down 2>/dev/null || true
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.prod.yml down 2>/dev/null || true

clean: ## Остановить и удалить контейнеры, образы и volumes
	@echo "$(RED)Очищаем контейнеры, образы и volumes...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml down -v --rmi all --remove-orphans 2>/dev/null || true
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.prod.yml down -v --rmi all --remove-orphans 2>/dev/null || true
	@echo "$(RED)Удаляем образы проекта...$(RESET)"
	@docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "($(APP_NAME)|nuxt-app)" | xargs docker rmi -f 2>/dev/null || true
	@echo "$(RED)Очищаем build cache (неиспользуемый кэш)...$(RESET)"
	@docker builder prune -f 2>/dev/null || true
	@echo "$(RED)Очищаем локальные кэш директории...$(RESET)"
	@rm -rf node_modules .nuxt .output
	@echo "$(GREEN)Очистка завершена!$(RESET)"

clean-cache: ## Очистить только кэш директории (.nuxt, .output)
	@echo "$(YELLOW)Очищаем кэш директории...$(RESET)"
	@rm -rf .nuxt .output
	@echo "$(GREEN)Локальный кэш очищен!$(RESET)"

clean-docker-cache: ## Очистить Docker volumes с кэшем Nuxt
	@echo "$(RED)Очищаем Docker volumes с кэшем...$(RESET)"
	@COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml down -v 2>/dev/null || true
	@docker volume rm $(APP_NAME)_nuxt-cache $(APP_NAME)_nuxt-output $(APP_NAME)_node_modules 2>/dev/null || true
	@echo "$(GREEN)Docker кэш очищен!$(RESET)"

clean-all: clean clean-docker-cache ## Полная очистка: контейнеры, volumes, кэш
	@echo "$(GREEN)Полная очистка завершена!$(RESET)"

logs: ## Показать логи development
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml logs -f

logs-prod: ## Показать логи production
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.prod.yml logs -f

shell: ## Подключиться к контейнеру приложения
	@echo "$(GREEN)Подключаемся к контейнеру...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app /bin/bash

db-shell: ## Подключиться к базе данных
	@echo "$(GREEN)Подключаемся к базе данных...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec db psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-test_platform}

db-migrate: ## Запустить миграции Prisma
	@echo "$(GREEN)Запускаем миграции...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma generate
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma migrate dev

db-generate: ## Генерировать Prisma Client
	@echo "$(GREEN)Генерируем Prisma Client...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma generate

db-studio: ## Открыть Prisma Studio
	@echo "$(GREEN)Открываем Prisma Studio...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma studio

db-seed: ## Заполнить базу тестовыми данными
	@echo "$(GREEN)Заполняем базу тестовыми данными...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma generate
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma db seed

db-seed-interview-questions: ## Заполнить базу вопросами для интервью
	@echo "$(GREEN)Заполняем базу вопросами для интервью...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma generate
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bun run prisma/seed-interview-questions.ts

restart: ## Перезапустить контейнеры
	@echo "$(YELLOW)Перезапускаем контейнеры...$(RESET)"
	$(MAKE) stop
	$(MAKE) dev-d

restart-prod: ## Перезапустить production контейнеры
	@echo "$(YELLOW)Перезапускаем production контейнеры...$(RESET)"
	$(MAKE) stop
	$(MAKE) prod

status: ## Показать статус контейнеров
	@echo "$(GREEN)Статус контейнеров (development):$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml ps 2>/dev/null || echo "Не запущены"
	@echo ""
	@echo "$(GREEN)Статус контейнеров (production):$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.prod.yml ps 2>/dev/null || echo "Не запущены"

setup: ## Первоначальная настройка проекта
	@echo "$(GREEN)Настройка проекта...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Копируем .env.example в .env$(RESET)"; \
		cp .env.example .env; \
	fi
	@echo "$(GREEN)Запускаем контейнеры...$(RESET)"
	$(MAKE) dev-d
	@echo "$(GREEN)Ожидаем запуск контейнеров...$(RESET)"
	sleep 10
	@echo "$(GREEN)Генерируем Prisma Client...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.standalone.yml exec app bunx prisma generate
	@echo "$(GREEN)Проект настроен! Доступен по адресу: http://localhost:3000$(RESET)"

