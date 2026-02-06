import { isAuthed } from './middleware';
import { t } from './trpc';

export const appRouter = t.router({
	hello: t.procedure.query(() => {
		return { message: 'Hello from tRPC!' };
	}),
	me: t.procedure.use(isAuthed).query(async ({ ctx }) => {
		const user = await ctx.prisma.user.findUnique({
			where: { id: ctx.user.id },
		});

		return {
			user: user,
			session: ctx.session,
		};
	}),
});

export type AppRouter = typeof appRouter;
