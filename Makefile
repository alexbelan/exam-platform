.PHONY: help dev prod build clean clean-cache logs shell db-shell install

# Загружаем переменные из .env файла
-include .env
export

# Имя приложения из .env или значение по умолчанию
APP_NAME ?= test-platform
SSG_CONTAINER_NAME := $(APP_NAME)-ssg
SSG_IMAGE_NAME := $(APP_NAME)-ssg

# Цвета для вывода
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help: ## Показать список доступных команд
	@echo "$(GREEN)Доступные команды:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'

install: ## Установить зависимости
	@echo "$(GREEN)Устанавливаем зависимости...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose run --rm app sh -lc "bun install --frozen-lockfile"

dev: ## Запустить в режиме разработки (с кэшем)
	@echo "$(GREEN)Очищаем локальные директории перед монтированием...$(RESET)"
	@rm -rf node_modules .nuxt .output
	@echo "$(GREEN)Собираем и запускаем контейнеры (с кэшем)...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose up --build -d
	@echo "$(GREEN)Ожидаем готовности Nuxt...$(RESET)"
	@COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app sh -lc 'while [ ! -d node_modules ] || [ ! -d .nuxt ]; do sleep 1; done'
	@echo "$(GREEN)Копируем node_modules из контейнера...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose cp app:/usr/src/app/node_modules ./node_modules
	@echo "$(GREEN)Копируем .nuxt из контейнера...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose cp app:/usr/src/app/.nuxt ./.nuxt || true
	@echo "$(GREEN)Копируем .output из контейнера...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose cp app:/usr/src/app/.output ./.output || true

prod: ## Запустить в production режиме
	@echo "$(GREEN)Запускаем в production режиме...$(RESET)"
	BUILD_TARGET=production COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml up --build -d

build: ## Собрать образы без запуска
	@echo "$(GREEN)Собираем образы...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose build

build-prod: ## Собрать production образ
	@echo "$(GREEN)Собираем production образ...$(RESET)"
	BUILD_TARGET=production COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml build

build-ssg: ## Собрать SSG образ (статический сайт)
	@echo "$(GREEN)Собираем SSG образ...$(RESET)"
	docker build -f Dockerfile.ssg -t $(SSG_IMAGE_NAME) .

run-ssg: ## Запустить SSG версию
	@echo "$(GREEN)Запускаем SSG версию...$(RESET)"
	docker run -d -p 3000:3000 --name $(SSG_CONTAINER_NAME) $(SSG_IMAGE_NAME)
	@echo "$(GREEN)SSG версия запущена на http://localhost:3000$(RESET)"

stop-ssg: ## Остановить SSG контейнер
	@echo "$(YELLOW)Останавливаем SSG контейнер...$(RESET)"
	docker stop $(SSG_CONTAINER_NAME) 2>/dev/null || true
	docker rm $(SSG_CONTAINER_NAME) 2>/dev/null || true

stop: ## Остановить контейнеры
	@echo "$(YELLOW)Останавливаем контейнеры...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose down
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml down 2>/dev/null || true

clean: ## Остановить и удалить контейнеры, образы, volumes и build cache текущего проекта
	@echo "$(RED)Очищаем контейнеры, образы и volumes текущего проекта...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose down -v --rmi all --remove-orphans
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml down -v --rmi all --remove-orphans 2>/dev/null || true
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
	@COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose down -v 2>/dev/null || true
	@docker volume rm $(APP_NAME)_nuxt-cache $(APP_NAME)_nuxt-output $(APP_NAME)_node_modules 2>/dev/null || true
	@echo "$(GREEN)Docker кэш очищен!$(RESET)"

clean-all: clean clean-docker-cache ## Полная очистка: контейнеры, volumes, кэш
	@echo "$(GREEN)Полная очистка завершена!$(RESET)"

logs: ## Показать логи
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose logs -f

logs-prod: ## Показать логи production
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml logs -f

shell: ## Подключиться к контейнеру приложения
	@echo "$(GREEN)Подключаемся к контейнеру...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app /bin/bash

shell-prod: ## Подключиться к production контейнеру
	@echo "$(GREEN)Подключаемся к production контейнеру...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml exec app /bin/bash

db-shell: ## Подключиться к базе данных
	@echo "$(GREEN)Подключаемся к базе данных...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec db psql -U app -d app

db-migrate: ## Запустить миграции Prisma
	@echo "$(GREEN)Генерируем Prisma Client...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app bunx prisma generate
	@echo "$(GREEN)Запускаем миграции...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app bunx prisma migrate dev

db-generate: ## Генерировать Prisma Client
	@echo "$(GREEN)Генерируем Prisma Client...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app bunx prisma generate

db-studio: ## Открыть Prisma Studio
	@echo "$(GREEN)Открываем Prisma Studio...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app bunx prisma studio

db-seed: ## Заполнить базу тестовыми данными
	@echo "$(GREEN)Генерируем Prisma Client...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app bunx prisma generate
	@echo "$(GREEN)Заполняем базу тестовыми данными...$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose exec app bunx prisma db seed

restart: ## Перезапустить контейнеры
	@echo "$(YELLOW)Перезапускаем контейнеры...$(RESET)"
	$(MAKE) stop
	$(MAKE) dev

restart-prod: ## Перезапустить production контейнеры
	@echo "$(YELLOW)Перезапускаем production контейнеры...$(RESET)"
	$(MAKE) stop
	$(MAKE) prod

status: ## Показать статус контейнеров
	@echo "$(GREEN)Статус контейнеров:$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose ps
	@echo ""
	@echo "$(GREEN)Production контейнеры:$(RESET)"
	COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Не запущены"

setup: ## Первоначальная настройка проекта
	@echo "$(GREEN)Настройка проекта...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Копируем .env.example в .env$(RESET)"; \
		cp .env.example .env; \
	fi
	$(MAKE) install
	$(MAKE) dev
	@echo "$(GREEN)Ожидаем запуск контейнеров...$(RESET)"
	sleep 10
	$(MAKE) db-generate
	@echo "$(GREEN)Проект настроен! Доступен по адресу: http://localhost:3000$(RESET)"

check-port: ## Проверить, не занят ли порт 3000
	@echo "$(GREEN)Проверяем порт 3000...$(RESET)"
	@lsof -i :3000 || echo "$(GREEN)Порт 3000 свободен$(RESET)"

check-docker: ## Проверить Docker конфигурацию
	@echo "$(GREEN)Проверяем Docker конфигурацию...$(RESET)"
	@echo "$(YELLOW)Версия Docker:$(RESET)"
	@docker --version
	@echo ""
	@echo "$(YELLOW)Docker Compose:$(RESET)"
	@docker compose version
	@echo ""
	@echo "$(YELLOW)Запущенные контейнеры:$(RESET)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(YELLOW)Использование ресурсов:$(RESET)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

debug: ## Режим отладки - показать подробную информацию
	@echo "$(GREEN)=== Информация о контейнерах ===$(RESET)"
	@COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose ps -a
	@echo ""
	@echo "$(GREEN)=== Последние 50 строк логов ===$(RESET)"
	@COMPOSE_PROJECT_NAME=$(APP_NAME) docker compose logs --tail=50
	@echo ""
	@echo "$(GREEN)=== Проверка порта 3000 ===$(RESET)"
	@lsof -i :3000 || echo "Порт 3000 свободен"
	@echo ""
	@echo "$(GREEN)=== Docker networks ===$(RESET)"
	@docker network ls
	@echo ""
	@echo "$(GREEN)=== Volumes ===$(RESET)"
	@docker volume ls | grep $(APP_NAME) || echo "Нет volumes"
