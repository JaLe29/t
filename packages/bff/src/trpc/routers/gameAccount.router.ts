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
	getUnits: t.procedure
		.use(isAuthed)
		.input(
			z.object({
				gameAccountId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Find game account
			const gameAccount = await ctx.prisma.gameAccount.findFirst({
				where: {
					id: input.gameAccountId,
					userId: ctx.user.id,
				},
			});

			if (!gameAccount || !gameAccount.gamePlayerId) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Game account not found or player ID missing',
				});
			}

			// Find latest scrape item for this gameworld
			const lastScrapeItem = await ctx.prisma.scrapeItem.findFirst({
				where: {
					gameworldId: gameAccount.gameworldId,
					isProcessed: true,
					isDryRun: false,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			if (!lastScrapeItem) {
				return {
					tribeId: null,
					villages: [],
				};
			}

			// Find player in latest scrape item
			const player = await ctx.prisma.player.findFirst({
				where: {
					scrapeItemId: lastScrapeItem.id,
					playerId: gameAccount.gamePlayerId,
				},
				select: {
					id: true,
					tribeId: true,
				},
			});

			if (!player) {
				return {
					tribeId: null,
					villages: [],
				};
			}

			// Get all villages for this player in latest scrape item
			const villages = await ctx.prisma.village.findMany({
				where: {
					playerId: player.id,
				},
				select: {
					villageId: true,
					name: true,
					x: true,
					y: true,
					population: true,
					isMainVillage: true,
					isCity: true,
				},
			});

			// Get latest unit records for each village
			const villageIds = villages.map(v => v.villageId);
			const unitRecords = await ctx.prisma.gameAccountUnitRecord.findMany({
				where: {
					gameAccountId: gameAccount.id,
					villageId: {
						in: villageIds,
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			// Group unit records by villageId and get the latest one for each village
			const latestUnitRecords = new Map<string, typeof unitRecords[0]>();
			for (const record of unitRecords) {
				if (!latestUnitRecords.has(record.villageId)) {
					latestUnitRecords.set(record.villageId, record);
				}
			}

			// Combine villages with their units
			const villagesWithUnits = villages.map(village => {
				const unitRecord = latestUnitRecords.get(village.villageId);
				return {
					villageId: village.villageId,
					name: village.name,
					x: village.x,
					y: village.y,
					population: village.population,
					isMainVillage: village.isMainVillage,
					isCity: village.isCity,
					units: unitRecord?.units || [],
					unitsUpdatedAt: unitRecord?.updatedAt || null,
				};
			});

			return {
				tribeId: player.tribeId,
				villages: villagesWithUnits,
			};
		}),
});
