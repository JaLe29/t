import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { getMapData, type PlayerData, register, updateSiteData } from '@t/backend-shared';

// import { register, getMapData } from '@t/backend-shared';

/**
 * Testovací skripty pro databázi
 */

const getGameWorld = async (prisma: PrismaClient) => {
	let gameWorld = await prisma.gameworld.findFirst({
		where: {
			name: 'CZ2',
		},
		include: {
			apiKeys: true,
		},
	});

	if (!gameWorld) {
		await prisma.gameworld.create({
			data: {
				name: 'CZ2',
				startTime: Math.floor(Date.now() / 1000),
				speed: 1,
				speedTroops: 1,
				version: '1',
			},
		});
		gameWorld = await prisma.gameworld.findFirst({
			where: {
				name: 'CZ2',
			},
			include: {
				apiKeys: true,
			},
		});
	}

	return gameWorld!;
};

const main = async () => {
	const connectionString = `${process.env.DATABASE_URL}`;
	const adapter = new PrismaPg({ connectionString });
	const prisma = new PrismaClient({ adapter });

	try {
		await prisma?.$connect();

		const tmp = await getGameWorld(prisma);

		if (!tmp.apiKeys) {
			const r1 = await register({
				url: 'https://cz2.kingdoms.com',
				email: 'some@email.com',
				siteName: 'someSiteName',
				siteUrl: 'http://www.someSite.url',
				isPublic: 'true',
			});

			await updateSiteData({
				privateApiKey: r1.privateApiKey!,
				url: 'https://cz2.kingdoms.com',
				email: 'some@email.com',
				siteName: 'someSiteName',
				siteUrl: 'http://www.someSite.url',
				isPublic: 'true',
			});

			await prisma.gameworld.update({
				where: { id: tmp.id },
				data: { apiKeys: { create: { apiKey: r1.apiKey!, privateApiKey: r1.privateApiKey! } } },
			});
		}

		const gw = await getGameWorld(prisma);

		const mapData = await getMapData({
			privateApiKey: gw.apiKeys!.privateApiKey!,
			url: 'https://cz2.kingdoms.com',
		});

		// biome-ignore lint/suspicious/noConsole: debug logging
		require('fs').writeFileSync('mapData.json', JSON.stringify(mapData, null, 2));

		// Parse mapData structure
		const gameworldData = mapData.gameworld;
		const players: PlayerData[] = mapData.players || [];
		const mapCells = mapData.map?.cells || [];
		const landscapes = mapData.landscapes || {};

		// Create ScrapeItem
		const scrapeItem = await prisma.scrapeItem.create({
			data: {
				gameworldId: gw.id,
				lastUpdateTime: gameworldData.lastUpdateTime,
				date: gameworldData.date,
				landscapes: landscapes,
				isDryRun: false,
				isProcessed: false,
			},
		});

		// biome-ignore lint/suspicious/noConsole: progress logging
		console.log(`Created ScrapeItem: ${scrapeItem.id}`);

		// Save all players using createMany
		if (players.length > 0) {
			const batchSize = 1000;
			for (let i = 0; i < players.length; i += batchSize) {
				const batch = players.slice(i, i + batchSize);
				await prisma.player.createMany({
					data: batch.map(playerData => ({
						playerId: playerData.playerId,
						name: playerData.name,
						tribeId: playerData.tribeId || null,
						kingdomId: playerData.kingdomId || null,
						treasures: playerData.treasures,
						role: playerData.role,
						externalLoginToken: playerData.externalLoginToken || null,
						scrapeItemId: scrapeItem.id,
					})),
					skipDuplicates: true,
				});
				// biome-ignore lint/suspicious/noConsole: progress logging
				console.log(`Saved players ${i + 1}-${Math.min(i + batchSize, players.length)} of ${players.length}`);
			}

			// Fetch all players to get their database IDs
			const playerIds = players.map(p => p.playerId);
			const dbPlayers = await prisma.player.findMany({
				where: {
					scrapeItemId: scrapeItem.id,
					playerId: { in: playerIds },
				},
				select: {
					id: true,
					playerId: true,
				},
			});

			// Create map: API playerId -> database id
			const playerIdMap = new Map(dbPlayers.map(p => [p.playerId, p.id]));

			// Collect all villages with correct playerId mapping
			const allVillages = players.flatMap(playerData => {
				const dbPlayerId = playerIdMap.get(playerData.playerId);
				if (!dbPlayerId) {
					// biome-ignore lint/suspicious/noConsole: warning logging
					console.warn(`Player ${playerData.playerId} not found in database, skipping villages`);
					return [];
				}
				return playerData.villages.map(villageData => ({
					villageId: villageData.villageId,
					x: Number.parseInt(villageData.x, 10),
					y: Number.parseInt(villageData.y, 10),
					population: Number.parseInt(villageData.population, 10),
					name: villageData.name,
					isMainVillage: villageData.isMainVillage,
					isCity: villageData.isCity,
					playerId: dbPlayerId,
				}));
			});

			// Save all villages using createMany
			if (allVillages.length > 0) {
				const batchSize = 1000;
				for (let i = 0; i < allVillages.length; i += batchSize) {
					const batch = allVillages.slice(i, i + batchSize);
					await prisma.village.createMany({
						data: batch,
						skipDuplicates: true,
					});
					// biome-ignore lint/suspicious/noConsole: progress logging
					console.log(
						`Saved villages ${i + 1}-${Math.min(i + batchSize, allVillages.length)} of ${allVillages.length}`,
					);
				}
			}

			// biome-ignore lint/suspicious/noConsole: progress logging
			console.log(`Saved ${players.length} players with ${allVillages.length} villages`);
		}

		// Save map cells in batches for better performance
		const batchSize = 1000;
		for (let i = 0; i < mapCells.length; i += batchSize) {
			const batch = mapCells.slice(i, i + batchSize);
			await prisma.mapCell.createMany({
				data: batch.map(cell => ({
					cellId: cell.id,
					x: Number.parseInt(cell.x, 10),
					y: Number.parseInt(cell.y, 10),
					resType: cell.resType === '0' ? null : cell.resType,
					oasis: cell.oasis === '0' ? null : cell.oasis,
					landscape: cell.landscape,
					kingdomId: String(cell.kingdomId),
					scrapeItemId: scrapeItem.id,
				})),
				skipDuplicates: true,
			});
			// biome-ignore lint/suspicious/noConsole: progress logging
			console.log(`Saved map cells ${i + 1}-${Math.min(i + batchSize, mapCells.length)} of ${mapCells.length}`);
		}

		// biome-ignore lint/suspicious/noConsole: progress logging
		console.log(`Saved ${mapCells.length} map cells`);
		// biome-ignore lint/suspicious/noConsole: progress logging
		console.log('Data saved successfully!');

		// Mark scrape as processed
		await prisma.scrapeItem.update({
			where: { id: scrapeItem.id },
			data: { isProcessed: true },
		});
		// biome-ignore lint/suspicious/noConsole: progress logging
		console.log('ScrapeItem marked as processed');
	} finally {
		await prisma?.$disconnect();
	}
};

main().catch(e => {
	// biome-ignore lint/suspicious/noConsole:  x
	console.error(e);
	process.exit(1);
});
