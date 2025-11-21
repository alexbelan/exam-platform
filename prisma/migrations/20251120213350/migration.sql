-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'LIFETIME');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('THEORETICAL', 'PRACTICAL', 'CODE_REVIEW', 'ALGORITHM', 'SYSTEM_DESIGN', 'BEHAVIORAL');

-- CreateEnum
CREATE TYPE "TestAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionType" "SubscriptionType" NOT NULL DEFAULT 'FREE',
    "subscriptionEndsAt" TIMESTAMP(3),
    "isLifetimeAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_submissions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "adminResponse" TEXT,
    "isResponseSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentType" "PaymentType" NOT NULL,
    "subscriptionPlan" "SubscriptionPlan",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProvider" TEXT NOT NULL,
    "providerId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" INTEGER,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "questionCount" INTEGER NOT NULL,
    "questionIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "primaryTagId" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_questions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_tests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "timeSpent" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "TestAttemptStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_question_answers" (
    "id" SERIAL NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userAnswerIds" INTEGER[],
    "correctAnswerIds" INTEGER[],
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_statistics" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalTestsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalCorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "uncorrectedQuestionsCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_statistics" (
    "id" SERIAL NOT NULL,
    "statisticsId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "theme" TEXT,
    "language" TEXT DEFAULT 'ru',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "defaultTestSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToTest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TagToTest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InterviewQuestionToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InterviewQuestionToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "question_answers_questionId_answerId_key" ON "question_answers"("questionId", "answerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_favorite_questions_userId_idx" ON "user_favorite_questions"("userId");

-- CreateIndex
CREATE INDEX "user_favorite_questions_questionId_idx" ON "user_favorite_questions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_questions_userId_questionId_key" ON "user_favorite_questions"("userId", "questionId");

-- CreateIndex
CREATE INDEX "user_favorite_tests_userId_idx" ON "user_favorite_tests"("userId");

-- CreateIndex
CREATE INDEX "user_favorite_tests_testId_idx" ON "user_favorite_tests"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_tests_userId_testId_key" ON "user_favorite_tests"("userId", "testId");

-- CreateIndex
CREATE INDEX "test_attempts_userId_idx" ON "test_attempts"("userId");

-- CreateIndex
CREATE INDEX "test_attempts_testId_idx" ON "test_attempts"("testId");

-- CreateIndex
CREATE INDEX "test_attempts_userId_testId_idx" ON "test_attempts"("userId", "testId");

-- CreateIndex
CREATE INDEX "test_attempts_completedAt_idx" ON "test_attempts"("completedAt");

-- CreateIndex
CREATE INDEX "test_attempts_score_idx" ON "test_attempts"("score");

-- CreateIndex
CREATE INDEX "test_question_answers_questionId_idx" ON "test_question_answers"("questionId");

-- CreateIndex
CREATE INDEX "test_question_answers_attemptId_idx" ON "test_question_answers"("attemptId");

-- CreateIndex
CREATE INDEX "test_question_answers_isCorrect_idx" ON "test_question_answers"("isCorrect");

-- CreateIndex
CREATE INDEX "test_question_answers_questionId_isCorrect_idx" ON "test_question_answers"("questionId", "isCorrect");

-- CreateIndex
CREATE INDEX "test_question_answers_attemptId_isCorrect_idx" ON "test_question_answers"("attemptId", "isCorrect");

-- CreateIndex
CREATE INDEX "test_question_answers_createdAt_idx" ON "test_question_answers"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "test_question_answers_attemptId_questionId_key" ON "test_question_answers"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_statistics_userId_key" ON "learning_statistics"("userId");

-- CreateIndex
CREATE INDEX "tag_statistics_tagId_idx" ON "tag_statistics"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_statistics_statisticsId_tagId_key" ON "tag_statistics"("statisticsId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "_TagToTest_B_index" ON "_TagToTest"("B");

-- CreateIndex
CREATE INDEX "_InterviewQuestionToTag_B_index" ON "_InterviewQuestionToTag"("B");

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_primaryTagId_fkey" FOREIGN KEY ("primaryTagId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_questions" ADD CONSTRAINT "user_favorite_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_questions" ADD CONSTRAINT "user_favorite_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_tests" ADD CONSTRAINT "user_favorite_tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_tests" ADD CONSTRAINT "user_favorite_tests_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_question_answers" ADD CONSTRAINT "test_question_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_question_answers" ADD CONSTRAINT "test_question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_statistics" ADD CONSTRAINT "learning_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_statistics" ADD CONSTRAINT "tag_statistics_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "learning_statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_statistics" ADD CONSTRAINT "tag_statistics_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTest" ADD CONSTRAINT "_TagToTest_A_fkey" FOREIGN KEY ("A") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTest" ADD CONSTRAINT "_TagToTest_B_fkey" FOREIGN KEY ("B") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewQuestionToTag" ADD CONSTRAINT "_InterviewQuestionToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewQuestionToTag" ADD CONSTRAINT "_InterviewQuestionToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
