import type { PrismaClient } from '@prisma/client';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export const createContext = async ({ req, res }: CreateFastifyContextOptions, options: { prisma: PrismaClient }) => {
	// Get session from main BFF (port 3334)
	const bffUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3334';
	let session = null;

	try {
		// Forward cookies and headers to main BFF
		const cookies = req.headers.cookie || '';
		const response = await fetch(`${bffUrl}/api/auth/session`, {
			method: 'GET',
			headers: {
				cookie: cookies,
				'user-agent': req.headers['user-agent'] || '',
			},
		});

		if (response.ok) {
			const data = await response.json();
			session = data.data || null;
		}
	} catch (error) {
		// If session fetch fails, continue without session
		// biome-ignore lint/suspicious/noConsole: error logging
		console.error('Failed to fetch session from main BFF:', error);
	}

	return {
		req,
		res,
		prisma: options.prisma,
		session,
		user: session?.user || null,
	};
};

export type Context = Awaited<ReturnType<typeof createContext>>;
