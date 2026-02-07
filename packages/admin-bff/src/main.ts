import cors from '@fastify/cors';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import type { CreateFastifyContextOptions, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { Server } from './Server';
import { createContext } from './trpc/context';
import { type AppRouter, appRouter } from './trpc/router';

const start = async (): Promise<void> => {
	const server = new Server({
		cors: false, // CORS is registered manually in main.ts
		appName: 'admin-bff',
		port: 3335,
		serveStatic: true,
		staticPath: process.env.NODE_ENV === 'production' ? './packages/admin-client/dist' : '../admin-client/dist',
	});

	const connectionString = `${process.env.DATABASE_URL}`;
	const adapter = new PrismaPg({ connectionString });
	const prisma = new PrismaClient({ adapter });
	await prisma?.$connect();

	// Register CORS
	const fastifyServer = server.getServer();
	await fastifyServer.register(cors, {
		origin: true,
		credentials: true,
	});

	await server.register(fastifyTRPCPlugin, {
		prefix: '/trpc',
		trpcOptions: {
			router: appRouter,
			createContext: ({ req, res }: CreateFastifyContextOptions) => createContext({ req, res }, { prisma }),
			onError({ path, error }) {
				// biome-ignore lint/suspicious/noConsole: no reason to change this
				console.error(`Error in tRPC handler on path '${path}':`, error);
			},
		} satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
	});
	await server.listen();
};

start().catch(e => {
	// biome-ignore lint/suspicious/noConsole: no reason to change this
	console.error(e);
});
