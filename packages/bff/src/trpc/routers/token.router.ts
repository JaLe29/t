import { TRPCError } from '@trpc/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { isAuthed } from '../middleware';
import { t } from '../trpc';

export const tokenRouter = t.router({
	list: t.procedure.use(isAuthed).query(async ({ ctx }) => {
		const tokens = await ctx.prisma.token.findMany({
			where: {
				userId: ctx.user.id,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				usages: {
					orderBy: {
						usedAt: 'desc',
					},
					take: 1,
				},
			},
		});

		return tokens.map(token => ({
			id: token.id,
			name: token.name,
			token: token.token,
			createdAt: token.createdAt,
			updatedAt: token.updatedAt,
			lastUsedAt: token.lastUsedAt,
			lastUsage: token.usages[0] || null,
		}));
	}),

	create: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				name: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Generate a secure random token (32 bytes = 64 hex characters)
			const tokenValue = `t_${randomBytes(32).toString('hex')}`;

			const token = await ctx.prisma.token.create({
				data: {
					userId: ctx.user.id,
					token: tokenValue,
					name: input.name || null,
				},
			});

			return {
				id: token.id,
				name: token.name,
				token: token.token,
				createdAt: token.createdAt,
				updatedAt: token.updatedAt,
				lastUsedAt: token.lastUsedAt,
			};
		}),

	delete: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				id: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify token belongs to user
			const token = await ctx.prisma.token.findFirst({
				where: {
					id: input.id,
					userId: ctx.user.id,
				},
			});

			if (!token) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Token not found',
				});
			}

			await ctx.prisma.token.delete({
				where: {
					id: input.id,
				},
			});

			return { success: true };
		}),

	trackUsage: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				tokenId: z.string().uuid(),
				ipAddress: z.string().optional(),
				userAgent: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify token belongs to user
			const token = await ctx.prisma.token.findFirst({
				where: {
					id: input.tokenId,
					userId: ctx.user.id,
				},
			});

			if (!token) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Token not found',
				});
			}

			// Create usage record
			await ctx.prisma.tokenUsage.create({
				data: {
					tokenId: input.tokenId,
					ipAddress: input.ipAddress || null,
					userAgent: input.userAgent || null,
				},
			});

			// Update lastUsedAt on token
			await ctx.prisma.token.update({
				where: {
					id: input.tokenId,
				},
				data: {
					lastUsedAt: new Date(),
				},
			});

			return { success: true };
		}),
});
