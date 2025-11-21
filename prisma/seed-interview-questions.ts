import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type QuestionFixture = {
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  categorySlug: string;
  tagSlugs: string[];
};

type AnswerFixture = {
  questionSlug: string;
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
};

const TAG_DEFINITIONS: Record<
  string,
  {
    name: string;
    categorySlug: "frontend" | "backend" | "theory";
  }
> = {
  javascript: { name: "JavaScript", categorySlug: "frontend" },
  "frontend-architecture": {
    name: "Frontend Architecture",
    categorySlug: "frontend",
  },
  performance: { name: "Performance", categorySlug: "frontend" },
  async: { name: "Async Patterns", categorySlug: "frontend" },
  typescript: { name: "TypeScript", categorySlug: "frontend" },
  react: { name: "React", categorySlug: "frontend" },
  testing: { name: "Testing", categorySlug: "frontend" },
  vue: { name: "Vue", categorySlug: "frontend" },
  css: { name: "CSS", categorySlug: "frontend" },
  accessibility: { name: "Accessibility", categorySlug: "frontend" },
  middle: { name: "Middle", categorySlug: "frontend" },
  senior: { name: "Senior", categorySlug: "frontend" },
  junior: { name: "Junior", categorySlug: "frontend" },
  nodejs: { name: "Node.js", categorySlug: "backend" },
  express: { name: "Express", categorySlug: "backend" },
  graphql: { name: "GraphQL", categorySlug: "backend" },
  rest: { name: "REST", categorySlug: "backend" },
  "system-design": { name: "System Design", categorySlug: "backend" },
  redis: { name: "Redis", categorySlug: "backend" },
  messaging: { name: "Messaging", categorySlug: "backend" },
  postgresql: { name: "PostgreSQL", categorySlug: "backend" },
  security: { name: "Security", categorySlug: "backend" },
  microservices: { name: "Microservices", categorySlug: "backend" },
  observability: { name: "Observability", categorySlug: "backend" },
  algorithms: { name: "Algorithms", categorySlug: "theory" },
  "data-structures": { name: "Data Structures", categorySlug: "theory" },
  complexity: { name: "Complexity Analysis", categorySlug: "theory" },
  "distributed-systems": {
    name: "Distributed Systems",
    categorySlug: "theory",
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUESTIONS_FILE = path.resolve(
  __dirname,
  "seed-data",
  "interview-questions.json"
);
const ANSWERS_FILE = path.resolve(
  __dirname,
  "seed-data",
  "interview-answers.json"
);

function loadFixtures<T>(filepath: string): T {
  return JSON.parse(readFileSync(filepath, "utf-8")) as T;
}

async function ensureTags(
  tagSlugs: Set<string>,
  categoryMap: Map<string, number>
) {
  await Promise.all(
    Array.from(tagSlugs).map(async (slug) => {
      const definition = TAG_DEFINITIONS[slug];
      if (!definition) {
        throw new Error(`No tag definition found for slug '${slug}'`);
      }

      const categoryId = categoryMap.get(definition.categorySlug);
      if (!categoryId) {
        throw new Error(
          `Category '${definition.categorySlug}' not found for tag '${slug}'`
        );
      }

      await prisma.tag.upsert({
        where: { slug },
        update: {
          name: definition.name,
          categoryId,
        },
        create: {
          slug,
          name: definition.name,
          category: { connect: { id: categoryId } },
        },
      });
    })
  );
}

async function main() {
  const questions = loadFixtures<QuestionFixture[]>(QUESTIONS_FILE);
  const answers = loadFixtures<AnswerFixture[]>(ANSWERS_FILE);

  const answersMap = new Map<string, AnswerFixture["answers"]>(
    answers.map((entry) => [entry.questionSlug, entry.answers])
  );

  const missingAnswerSlugs = questions
    .filter((question) => !answersMap.has(question.slug))
    .map((question) => question.slug);

  if (missingAnswerSlugs.length) {
    throw new Error(
      `Missing answer sets for: ${missingAnswerSlugs.join(", ")}`
    );
  }

  const categorySlugs = Array.from(
    new Set(questions.map((question) => question.categorySlug))
  );

  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
  });

  const categoryMap = new Map<string, number>(
    categories.map((category) => [category.slug, category.id])
  );

  const unknownCategories = categorySlugs.filter(
    (slug) => !categoryMap.has(slug)
  );

  if (unknownCategories.length) {
    throw new Error(
      `Categories not found: ${unknownCategories
        .map((slug) => `'${slug}'`)
        .join(", ")}`
    );
  }

  const tagSlugs = new Set(questions.flatMap((question) => question.tagSlugs));
  await ensureTags(tagSlugs, categoryMap);

  const questionTitles = questions.map((question) => question.title);

  await prisma.questionAnswer.deleteMany({
    where: { question: { title: { in: questionTitles } } },
  });

  await prisma.answer.deleteMany({
    where: {
      questionAnswers: {
        some: { question: { title: { in: questionTitles } } },
      },
    },
  });

  await prisma.interviewQuestion.deleteMany({
    where: { title: { in: questionTitles } },
  });

  let createdCount = 0;

  for (const question of questions) {
    const answerOptions = answersMap.get(question.slug);
    if (!answerOptions) {
      continue;
    }

    if (answerOptions.length !== 4) {
      throw new Error(
        `Question '${question.slug}' must have exactly 4 answers, got ${answerOptions.length}`
      );
    }

    await prisma.$transaction(async (tx) => {
      const createdQuestion = await tx.interviewQuestion.create({
        data: {
          title: question.title,
          content: question.content,
          isPublished: question.isPublished,
          categoryId: categoryMap.get(question.categorySlug)!,
          tags: {
            connect: question.tagSlugs.map((slug) => ({ slug })),
          },
        },
      });

      const createdAnswers: { id: number }[] = [];

      for (const option of answerOptions) {
        const answer = await tx.answer.create({
          data: { text: option.text },
        });
        createdAnswers.push({ id: answer.id });
      }

      await tx.questionAnswer.createMany({
        data: createdAnswers.map((answer, index) => ({
          questionId: createdQuestion.id,
          answerId: answer.id,
          isCorrect: answerOptions[index].isCorrect,
        })),
      });
    });

    createdCount += 1;
  }

  console.log(`✅ Seeded ${createdCount} interview questions and answers.`);
}

main()
  .catch((error) => {
    console.error("❌ Failed to seed interview questions:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
