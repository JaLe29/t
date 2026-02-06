import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { type AwilixContainer, asValue, createContainer, InjectionMode } from 'awilix';

export interface Container {
	prisma: PrismaClient;
}

export const createDiContainer = async (): Promise<AwilixContainer<Container>> => {
	const container = createContainer<Container>({
		injectionMode: InjectionMode.CLASSIC,
	});

	const connectionString = `${process.env.DATABASE_URL}`;
	const adapter = new PrismaPg({ connectionString });
	const prisma = new PrismaClient({ adapter });

	// Register dependencies
	container.register({
		prisma: asValue(prisma),
	});

	return container;
};
