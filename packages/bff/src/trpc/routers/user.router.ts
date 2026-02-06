import { z } from 'zod';
import { isAuthed } from '../middleware';
import { t } from '../trpc';

export const userRouter = t.router({
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
	updateName: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				name: z.string().min(1).max(100),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updatedUser = await ctx.prisma.user.update({
				where: { id: ctx.user.id },
				data: { name: input.name },
			});

			return { user: updatedUser };
		}),
	changePassword: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				currentPassword: z.string().min(1),
				newPassword: z.string().min(8),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Convert Fastify headers to Headers object for Better Auth
			const headers = new Headers();
			for (const [key, value] of Object.entries(ctx.req.headers)) {
				if (value) {
					if (Array.isArray(value)) {
						for (const v of value) {
							headers.append(key, v);
						}
					} else {
						headers.set(key, value);
					}
				}
			}

			// Use Better Auth API to change password
			const response = await ctx.auth.api.changePassword({
				body: {
					currentPassword: input.currentPassword,
					newPassword: input.newPassword,
				},
				headers,
			});

			if (!response) {
				throw new Error('Failed to change password');
			}

			return { success: true };
		}),
});
