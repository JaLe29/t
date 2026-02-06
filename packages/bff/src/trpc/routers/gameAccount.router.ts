import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { isAuthed } from '../middleware';
import { t } from '../trpc';

export const gameAccountRouter = t.router({
	searchPlayers: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				gameworldId: z.string(),
				query: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Find latest active scrape item for this gameworld
			const lastScrapeItem = await ctx.prisma.scrapeItem.findFirst({
				where: {
					gameworldId: input.gameworldId,
					isProcessed: true,
					isDryRun: false,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			if (!lastScrapeItem) {
				return [];
			}

			// Search players by name
			const players = await ctx.prisma.player.findMany({
				where: {
					scrapeItemId: lastScrapeItem.id,
					name: {
						contains: input.query,
						mode: 'insensitive',
					},
				},
				take: 10,
				orderBy: {
					name: 'asc',
				},
				select: {
					id: true,
					playerId: true,
					name: true,
					tribeId: true,
				},
			});

			return players;
		}),
	create: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				gameworldId: z.string(),
				playerName: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Find latest active scrape item for this gameworld
			const lastScrapeItem = await ctx.prisma.scrapeItem.findFirst({
				where: {
					gameworldId: input.gameworldId,
					isProcessed: true,
					isDryRun: false,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			if (!lastScrapeItem) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'No active scrape item found for this gameworld',
				});
			}

			// Find player by name in latest scrape item
			const player = await ctx.prisma.player.findFirst({
				where: {
					scrapeItemId: lastScrapeItem.id,
					name: {
						equals: input.playerName,
						mode: 'insensitive',
					},
				},
				select: {
					playerId: true,
				},
			});

			if (!player) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Player not found in the latest scrape',
				});
			}

			// Create or update game account
			// Store playerId (Travian API ID), which is constant across scrape items
			const gameAccount = await ctx.prisma.gameAccount.upsert({
				where: {
					userId_gameworldId: {
						userId: ctx.user.id,
						gameworldId: input.gameworldId,
					},
				},
				update: {
					gamePlayerId: player.playerId,
				},
				create: {
					userId: ctx.user.id,
					gameworldId: input.gameworldId,
					gamePlayerId: player.playerId,
				},
			});

			return gameAccount;
		}),
	list: t.procedure.use(isAuthed).query(async ({ ctx }) => {
		const gameAccounts = await ctx.prisma.gameAccount.findMany({
			where: {
				userId: ctx.user.id,
			},
			include: {
				gameworld: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

			// Get player names - find player by playerId (Travian API ID) in latest scrape item
			const accountsWithPlayerNames = await Promise.all(
				gameAccounts.map(async account => {
					if (!account.gamePlayerId) {
						return {
							...account,
							playerName: null,
							playerTribeId: null,
						};
					}

					// Find latest scrape item for this gameworld
					const lastScrapeItem = await ctx.prisma.scrapeItem.findFirst({
						where: {
							gameworldId: account.gameworldId,
							isProcessed: true,
							isDryRun: false,
						},
						orderBy: {
							createdAt: 'desc',
						},
					});

					if (!lastScrapeItem) {
						return {
							...account,
							playerName: null,
							playerTribeId: null,
						};
					}

					// Find player by playerId (Travian API ID) in latest scrape item
					const player = await ctx.prisma.player.findFirst({
						where: {
							scrapeItemId: lastScrapeItem.id,
							playerId: account.gamePlayerId,
						},
						select: {
							name: true,
							tribeId: true,
						},
					});

					return {
						...account,
						playerName: player?.name || null,
						playerTribeId: player?.tribeId || null,
					};
				}),
			);

		return accountsWithPlayerNames;
	}),
	delete: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const gameAccount = await ctx.prisma.gameAccount.findFirst({
				where: {
					id: input.id,
					userId: ctx.user.id,
				},
			});

			if (!gameAccount) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Game account not found',
				});
			}

			await ctx.prisma.gameAccount.delete({
				where: {
					id: input.id,
				},
			});

			return { success: true };
		}),
});
