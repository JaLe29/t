import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { isAuthed } from '../middleware';
import { t } from '../trpc';

export const gameworldRouter = t.router({
	getActive: t.procedure.use(isAuthed).query(async ({ ctx }) => {
		const gameworlds = await ctx.prisma.gameworld.findMany({
			where: {
				isActive: true,
			},
			orderBy: {
				name: 'asc',
			},
		});

		return gameworlds;
	}),
	createRequest: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				name: z.string().min(1, 'Server name is required'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if gameworld with this name already exists
			const existingGameworld = await ctx.prisma.gameworld.findUnique({
				where: { name: input.name },
			});

			if (existingGameworld) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Server with this name already exists',
				});
			}

			// Check if request with this name already exists
			const existingRequest = await ctx.prisma.gameworldRequest.findFirst({
				where: {
					name: input.name,
					status: {
						in: ['pending', 'approved'],
					},
				},
			});

			if (existingRequest) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Request for this server already exists',
				});
			}

			const request = await ctx.prisma.gameworldRequest.create({
				data: {
					name: input.name,
					userId: ctx.user.id,
					status: 'pending',
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			return request;
		}),
	listRequests: t.procedure.use(isAuthed).query(async ({ ctx }) => {
		const requests = await ctx.prisma.gameworldRequest.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return requests;
	}),
	updateRequestStatus: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				id: z.string(),
				status: z.enum(['approved', 'rejected']),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const request = await ctx.prisma.gameworldRequest.findUnique({
				where: { id: input.id },
			});

			if (!request) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Request not found',
				});
			}

			if (request.status !== 'pending') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Request has already been processed',
				});
			}

			const updatedRequest = await ctx.prisma.gameworldRequest.update({
				where: { id: input.id },
				data: { status: input.status },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			return updatedRequest;
		}),
});
