import { router } from "../index";
import { authRouter } from "./auth";
import { testsRouter } from "./tests";
import { questionsRouter } from "./questions";
import { answersRouter } from "./answers";
import { tagsRouter } from "./tags";
import { tagCategoriesRouter } from "./tagCategories";
import { usersRouter } from "./users";
import { profileRouter } from "./profile";

export const appRouter = router({
  auth: authRouter,
  tests: testsRouter,
  questions: questionsRouter,
  answers: answersRouter,
  tags: tagsRouter,
  tagCategories: tagCategoriesRouter,
  users: usersRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
