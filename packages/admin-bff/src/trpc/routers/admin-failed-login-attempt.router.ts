import { z } from 'zod';
import { t } from '../trpc';

export const adminFailedLoginAttemptRouter = t.router({
	list: t.procedure
		.input(
			z
				.object({
					search: z.string().optional(),
					limit: z.number().min(1).max(1000).optional().default(100),
					offset: z.number().min(0).optional().default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const whereConditions: Array<{
				OR?: Array<
					| { email: { contains: string; mode: 'insensitive' } }
					| { ipAddress: { contains: string; mode: 'insensitive' } }
					| { reason: { contains: string; mode: 'insensitive' } }
				>;
			}> = [];

			if (input?.search) {
				whereConditions.push({
					OR: [
						{ email: { contains: input.search, mode: 'insensitive' } },
						{ ipAddress: { contains: input.search, mode: 'insensitive' } },
						{ reason: { contains: input.search, mode: 'insensitive' } },
					],
				});
			}

			const [attempts, total] = await Promise.all([
				ctx.prisma.failedLoginAttempt.findMany({
					where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
					orderBy: {
						createdAt: 'desc',
					},
					take: input?.limit || 100,
					skip: input?.offset || 0,
				}),
				ctx.prisma.failedLoginAttempt.count({
					where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				}),
			]);

			return {
				attempts,
				total,
			};
		}),

	get: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const attempt = await ctx.prisma.failedLoginAttempt.findUnique({
				where: { id: input.id },
			});

			if (!attempt) {
				throw new Error('Failed login attempt not found');
			}

			return attempt;
		}),

	delete: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.failedLoginAttempt.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	deleteMany: t.procedure
		.input(
			z.object({
				ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.failedLoginAttempt.deleteMany({
				where: {
					id: {
						in: input.ids,
					},
				},
			});

			return { success: true, deletedCount: input.ids.length };
		}),

	deleteAll: t.procedure.mutation(async ({ ctx }) => {
		const result = await ctx.prisma.failedLoginAttempt.deleteMany({});

		return { success: true, deletedCount: result.count };
	}),
});
