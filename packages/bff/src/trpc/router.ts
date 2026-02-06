import { gameAccountRouter } from './routers/gameAccount.router';
import { gameworldRouter } from './routers/gameworld.router';
import { userRouter } from './routers/user.router';
import { t } from './trpc';

export const appRouter = t.router({
	user: userRouter,
	gameworld: gameworldRouter,
	gameAccount: gameAccountRouter,
});

export type AppRouter = typeof appRouter;
