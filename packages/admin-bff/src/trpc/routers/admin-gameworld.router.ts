import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../trpc';

export const adminGameworldRouter = t.router({
	list: t.procedure
		.input(
			z
				.object({
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const whereConditions: Array<{
				name?: { contains: string; mode: 'insensitive' };
			}> = [];

			if (input?.search) {
				whereConditions.push({
					name: { contains: input.search, mode: 'insensitive' },
				});
			}

			const gameworlds = await ctx.prisma.gameworld.findMany({
				where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				orderBy: {
					createdAt: 'desc',
				},
			});

			return gameworlds;
		}),

	get: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const gameworld = await ctx.prisma.gameworld.findUnique({
				where: { id: input.id },
			});

			if (!gameworld) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Gameworld not found',
				});
			}

			return gameworld;
		}),

	create: t.procedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				startTime: z.number().int().min(0),
				speed: z.number().min(0.1).max(100),
				speedTroops: z.number().min(0.1).max(100),
				version: z.string().min(1).max(50),
				isActive: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if name already exists
			const existing = await ctx.prisma.gameworld.findUnique({
				where: { name: input.name },
			});

			if (existing) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Gameworld with this name already exists',
				});
			}

			const gameworld = await ctx.prisma.gameworld.create({
				data: {
					name: input.name,
					startTime: input.startTime,
					speed: input.speed,
					speedTroops: input.speedTroops,
					version: input.version,
					isActive: input.isActive,
				},
			});

			return gameworld;
		}),

	update: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
				name: z.string().min(1).max(255).optional(),
				startTime: z.number().int().min(0).optional(),
				speed: z.number().min(0.1).max(100).optional(),
				speedTroops: z.number().min(0.1).max(100).optional(),
				version: z.string().min(1).max(50).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Check if name already exists (if name is being updated)
			if (updateData.name) {
				const existing = await ctx.prisma.gameworld.findFirst({
					where: {
						name: updateData.name,
						id: { not: id },
					},
				});

				if (existing) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'Gameworld with this name already exists',
					});
				}
			}

			const gameworld = await ctx.prisma.gameworld.update({
				where: { id },
				data: updateData,
			});

			return gameworld;
		}),

	delete: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.gameworld.delete({
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
			await ctx.prisma.gameworld.deleteMany({
				where: {
					id: {
						in: input.ids,
					},
				},
			});

			return { success: true, deletedCount: input.ids.length };
		}),
});
