import type { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const createAuth = (prisma: PrismaClient) => {
	return betterAuth({
		database: prismaAdapter(prisma, {
			provider: 'postgresql',
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID || '',
				clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
			},
		},
		baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3334',
		basePath: '/api/auth',
		secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
		trustedOrigins: [
			process.env.BETTER_AUTH_URL || 'http://localhost:3334',
			'http://localhost:5173',
			'http://localhost:3000',
			'http://localhost:3001',
		],
		rateLimit: {
			enabled: process.env.NODE_ENV === 'production',
			customRules: {
				'/sign-in/email': {
					window: 10, // 10 sekund
					max: 3, // max 3 pokusy za 10 sekund
				},
			},
		},
	});
};

export type Auth = ReturnType<typeof createAuth>;
