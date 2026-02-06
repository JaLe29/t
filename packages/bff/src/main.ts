import cors from '@fastify/cors';
import { getMapData, register, updateSiteData } from '@t/backend-shared';
import type { CreateFastifyContextOptions, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createAuth } from './auth';
import { createDiContainer } from './container';
import { registerAuthRoutes } from './routes/auth.routes';
import { Server } from './Server';
import { createContext } from './trpc/context';
import { type AppRouter, appRouter } from './trpc/router';

const start = async (): Promise<void> => {
	const server = new Server({
		cors: false, // CORS is registered manually in main.ts
		appName: 'bff',
		port: 3334,
		serveStatic: true,
		staticPath: process.env.NODE_ENV === 'production' ? './packages/client/dist' : '../client/dist',
	});

	// Create DI container
	const container = await createDiContainer();
	const prisma = container.cradle.prisma;
	await prisma?.$connect();

	const auth = createAuth(prisma);

	// Register CORS before Better Auth routes
	const fastifyServer = server.getServer();
	await fastifyServer.register(cors, {
		origin: true,
		credentials: true,
	});

	// Register auth routes
	registerAuthRoutes(fastifyServer, auth, prisma);

	await server.register(fastifyTRPCPlugin, {
		prefix: '/trpc',
		trpcOptions: {
			router: appRouter,
			createContext: ({ req, res }: CreateFastifyContextOptions) =>
				createContext({ req, res }, { prisma, auth, container }),
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
