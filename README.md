# Платформа для тестирования и подготовки

Современная веб-платформа для прохождения тестов и подготовки к экзаменам. Система позволяет пользователям проходить тесты, отслеживать прогресс, анализировать ошибки и улучшать свои знания.

## ✨ Особенности

- **Standalone режим** — полностью самодостаточное приложение, работает без внешних зависимостей
- **Гибкая архитектура** — можно использовать как отдельный проект или интегрировать в существующую инфраструктуру
- **Docker-ready** — готовые конфигурации для быстрого запуска
- **Feature-Sliced Design** — чистая и масштабируемая архитектура кода

## 🚀 Возможности

- **Прохождение тестов** — интерактивное тестирование с различными типами вопросов
- **Отслеживание прогресса** — статистика по пройденным тестам и правильным ответам
- **Анализ ошибок** — просмотр неправильных ответов для улучшения знаний
- **Избранное** — сохранение важных вопросов и тестов для быстрого доступа
- **Административная панель** — управление вопросами, тестами, тегами и категориями
- **Фильтрация** — удобный поиск по тегам и категориям

## 🛠 Технологический стек

- **Runtime & Package Manager**: [Bun](https://bun.sh) — быстрый JavaScript runtime и пакетный менеджер
- **Framework**: [Nuxt 4](https://nuxt.com) — Vue.js фреймворк для SSR приложений
- **UI Library**: [PrimeVue 4](https://primevue.org) — компонентная библиотека для Vue
- **State Management**: [Pinia](https://pinia.vuejs.org) — официальное хранилище состояния для Vue
- **Database**: [PostgreSQL](https://www.postgresql.org) — реляционная база данных
- **ORM**: [Prisma](https://www.prisma.io) — современный ORM для TypeScript
- **Architecture**: [Feature-Sliced Design (FSD)](https://feature-sliced.design) — методология организации кода
- **Authentication**: [nuxt-auth-utils](https://github.com/Hebilicious/nuxt-auth-utils) — утилиты для аутентификации

## 📋 Требования

- [Docker](https://www.docker.com/get-started) и Docker Compose
- Или [Bun](https://bun.sh) для локальной разработки
- PostgreSQL 17+ (если запускаете без Docker)
- Git

## 🚀 Быстрый старт

### Вариант 1: Standalone режим (Рекомендуется для опенсорс)

Самодостаточный режим запуска с собственной базой данных:

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd <project-directory>

# Скопируйте файл с переменными окружения
cp .env.example .env

# Запустите первоначальную настройку в standalone режиме
make setup-standalone
```

После выполнения команды `make setup-standalone` проект будет доступен по адресу: http://localhost:3000

### Вариант 2: Локальная разработка (без Docker)

Если вы предпочитаете работать без Docker:

```bash
# 1. Установите зависимости
bun install

# 2. Настройте базу данных PostgreSQL
# Создайте базу данных и настройте DATABASE_URL в .env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_platform"

# 3. Запустите миграции
bunx prisma migrate dev

# 4. (Опционально) Заполните базу тестовыми данными
bunx prisma db seed

# 5. Запустите приложение
bun run dev
```

### Вариант 3: Стандартный Docker режим

Для использования с существующей инфраструктурой:

```bash
# 1. Установите зависимости
make install

# 2. Запустите контейнеры в режиме разработки
make dev

# 3. Сгенерируйте Prisma Client
make db-generate

# 4. (Опционально) Запустите миграции базы данных
make db-migrate

# 5. (Опционально) Заполните базу тестовыми данными
make db-seed
```

## 🐳 Docker команды

Проект использует Docker для изоляции окружения. Все команды доступны через Makefile:

### Standalone режим (рекомендуется)

```bash
make dev-standalone        # Запустить в standalone режиме (development)
make dev-standalone-d      # Запустить в standalone режиме в фоне
make prod-standalone       # Запустить в standalone режиме (production)
make stop-standalone       # Остановить standalone контейнеры
make logs-standalone       # Показать логи standalone
make db-migrate-standalone # Запустить миграции в standalone
make db-seed-standalone    # Заполнить базу тестовыми данными
make db-studio-standalone  # Открыть Prisma Studio
make shell-standalone      # Подключиться к контейнеру
make clean-standalone      # Очистить standalone контейнеры и volumes
make setup-standalone      # Первоначальная настройка в standalone режиме
```

### Стандартные команды

```bash
make dev          # Запустить в режиме разработки
make prod         # Запустить в production режиме
make stop         # Остановить контейнеры
make restart      # Перезапустить контейнеры
make logs         # Показать логи контейнеров
```

### Сборка

```bash
make build        # Собрать образы для разработки
make build-prod   # Собрать production образ
make build-ssg    # Собрать SSG образ (статический сайт)
```

### База данных

```bash
# Standalone режим
make db-migrate-standalone   # Запустить миграции в standalone
make db-seed-standalone      # Заполнить базу тестовыми данными
make db-studio-standalone    # Открыть Prisma Studio
make db-shell-standalone     # Подключиться к базе данных через psql

# Стандартный режим
make db-generate  # Сгенерировать Prisma Client
make db-migrate   # Запустить миграции
make db-seed      # Заполнить базу тестовыми данными
make db-studio    # Открыть Prisma Studio
make db-shell     # Подключиться к базе данных через psql
```

### Очистка

```bash
make clean        # Остановить и удалить контейнеры, образы, volumes
make clean-cache  # Очистить только кэш директории (.nuxt, .output)
make clean-all    # Полная очистка: контейнеры, volumes, кэш
```

### Утилиты

```bash
make help         # Показать список всех доступных команд
make status       # Показать статус контейнеров
make shell        # Подключиться к контейнеру приложения
make debug        # Режим отладки с подробной информацией
```

## 📁 Структура проекта

Проект организован по методологии **Feature-Sliced Design (FSD)**:

```
src/
├── app/          # Инициализация приложения, layouts, middleware, routes
├── pages/        # Страницы приложения
├── widgets/      # Композиционный слой (каталоги, виджеты)
├── features/     # Пользовательские сценарии (фильтры, модальные окна)
├── entities/     # Бизнес-сущности (карточки, навигация)
└── shared/       # Переиспользуемые компоненты, утилиты, хуки

server/           # API endpoints и серверная логика
prisma/           # Схемы базы данных и миграции
```

### Алиасы импортов

Проект использует следующие алиасы для удобного импорта:

- `@shared` → `src/shared`
- `@entities` → `src/entities`
- `@features` → `src/features`
- `@widgets` → `src/widgets`
- `@pages` → `src/pages`

## 🔧 Разработка

### Переменные окружения

Создайте файл `.env` на основе `.env.example` и настройте следующие переменные:

#### Обязательные переменные

- `POSTGRES_USER` — пользователь базы данных (по умолчанию: `postgres`)
- `POSTGRES_PASSWORD` — пароль базы данных (по умолчанию: `postgres`)
- `POSTGRES_DB` — название базы данных (по умолчанию: `test_platform`)
- `NUXT_SESSION_PASSWORD` — пароль для сессий (обязательно измените в production, минимум 32 символа)

#### Опциональные переменные

- `APP_NAME` — имя приложения для Docker контейнеров (по умолчанию: `test-platform`)
- `APP_PORT` — порт приложения (по умолчанию: `3000`)
- `POSTGRES_PORT` — порт базы данных (по умолчанию: `5432`)
- `COMPANY_NAME` — название компании для отображения
- `ADMIN_EMAIL` — email администратора для seed (по умолчанию: `admin@example.com`)
- `ADMIN_PASSWORD` — пароль администратора для seed (по умолчанию: `admin123`)
- `ADMIN_FIRST_NAME` — имя администратора (по умолчанию: `Admin`)
- `ADMIN_LAST_NAME` — фамилия администратора (по умолчанию: `User`)

**Примечание:** В standalone режиме `DATABASE_URL` формируется автоматически из переменных `POSTGRES_USER`, `POSTGRES_PASSWORD` и `POSTGRES_DB`. Для локальной разработки без Docker настройте `DATABASE_URL` напрямую.

### Работа с базой данных

```bash
# Генерация Prisma Client после изменения схемы
make db-generate

# Создание новой миграции
make db-migrate

# Применение миграций в production
docker compose exec app bunx prisma migrate deploy

# Открыть Prisma Studio для просмотра данных
make db-studio
```

### Структура API

API endpoints находятся в директории `server/api/`:

- `/api/questions` — управление вопросами
- `/api/tests` — управление тестами
- `/api/answers` — отправка ответов
- `/api/profile` — профиль пользователя и статистика
- `/api/tags` — управление тегами
- `/api/tag-categories` — управление категориями тегов

## 🏗 Production

### Standalone режим (рекомендуется)

```bash
# Сборка production образа
make build-standalone-prod

# Запуск в production режиме
make prod-standalone
```

### Стандартный режим

```bash
# Сборка production образа
make build-prod

# Запуск в production режиме
make prod
```

### Статическая генерация (SSG)

Для генерации статического сайта:

```bash
make build-ssg    # Собрать SSG образ
make run-ssg       # Запустить SSG версию
```

## 📝 Скрипты

Доступные npm/bun скрипты:

```bash
bun run dev              # Запуск dev сервера
bun run build            # Сборка для production
bun run preview          # Предпросмотр production сборки
bun run generate         # Генерация статического сайта
bun run db:generate      # Генерация Prisma Client
bun run db:migrate       # Запуск миграций
bun run db:seed          # Заполнение базы тестовыми данными
bun run db:studio        # Открыть Prisma Studio
```
