-- AlterTable
ALTER TABLE "interview_questions" ADD COLUMN     "requiresPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "requiresPremium" BOOLEAN NOT NULL DEFAULT false;
