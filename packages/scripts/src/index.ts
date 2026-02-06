import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// import { register, getMapData } from '@t/backend-shared';

/**
 * Testovací skripty pro databázi
 */

const main = async () => {
	const connectionString = `${process.env.DATABASE_URL}`;
	const adapter = new PrismaPg({ connectionString });
	const prisma = new PrismaClient({ adapter });
	await prisma?.$connect();
	let gameWorld = await prisma.gameworld.findFirst({
		where: {
			name: 'CZ2',
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
		});
	}
	console.log(JSON.stringify(gameWorld, null, 2));
};

main()
	.catch(e => {
		// biome-ignore lint/suspicious/noConsole:  x
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {});
