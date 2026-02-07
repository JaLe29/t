import type { PrismaClient } from '@prisma/client';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import type { AwilixContainer } from 'awilix';
import type { Auth } from '../auth';
import type { Container } from '../container';

export const createContext = async (
	{ req, res }: CreateFastifyContextOptions,
	options: { prisma: PrismaClient; auth: Auth; container: AwilixContainer<Container> },
) => {
	// Convert Fastify headers to Headers object for Better Auth
	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			if (Array.isArray(value)) {
				for (const v of value) {
					headers.append(key, v);
				}
			} else {
				headers.set(key, value);
			}
		}
	}

	// Get session from Better Auth
	const session = await options.auth.api.getSession({
		headers,
	});

	return {
		req,
		res,
		prisma: options.prisma,
		auth: options.auth,
		container: options.container,
		session,
		user: session?.user || null,
	};
};

export type Context = Awaited<ReturnType<typeof createContext>>;
