import { adminFailedLoginAttemptRouter } from './routers/admin-failed-login-attempt.router';
import { adminGameworldRouter } from './routers/admin-gameworld.router';
import { adminUserRouter } from './routers/admin-user.router';
import { t } from './trpc';

export const appRouter = t.router({
	hello: t.procedure.query(() => {
		return { message: 'Hello from Admin tRPC!' };
	}),
	adminUser: adminUserRouter,
	adminFailedLoginAttempt: adminFailedLoginAttemptRouter,
	adminGameworld: adminGameworldRouter,
});

export type AppRouter = typeof appRouter;
