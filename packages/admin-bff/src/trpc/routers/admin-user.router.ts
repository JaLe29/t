import { TRPCError } from '@trpc/server';
import { randomBytes, scrypt } from 'crypto';
import { z } from 'zod';
import { t } from '../trpc';

export const adminUserRouter = t.router({
	list: t.procedure
		.input(
			z
				.object({
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const whereConditions: Array<{
				OR?: Array<
					| { name: { contains: string; mode: 'insensitive' } }
					| { email: { contains: string; mode: 'insensitive' } }
				>;
			}> = [];

			if (input?.search) {
				whereConditions.push({
					OR: [
						{ name: { contains: input.search, mode: 'insensitive' } },
						{ email: { contains: input.search, mode: 'insensitive' } },
					],
				});
			}

			const users = await ctx.prisma.user.findMany({
				where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
				orderBy: {
					createdAt: 'desc',
				},
			});

			return users;
		}),

	get: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findUnique({
				where: { id: input.id },
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found',
				});
			}

			return user;
		}),

	create: t.procedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				email: z.string().email().optional().nullable(),
				emailVerified: z.boolean().default(false),
				image: z.string().optional().nullable(),
				photo: z.string().optional().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.create({
				data: {
					name: input.name,
					email: input.email || null,
					emailVerified: input.emailVerified,
					image: input.image || null,
					photo: input.photo || null,
				},
			});

			return user;
		}),

	update: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
				name: z.string().min(1).max(255).optional(),
				email: z.string().email().optional().nullable(),
				emailVerified: z.boolean().optional(),
				image: z.string().optional().nullable(),
				photo: z.string().optional().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			const user = await ctx.prisma.user.update({
				where: { id },
				data: updateData,
			});

			return user;
		}),

	delete: t.procedure
		.input(
			z.object({
				id: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.user.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	deleteMany: t.procedure
		.input(
			z.object({
				ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.user.deleteMany({
				where: {
					id: {
						in: input.ids,
					},
				},
			});

			return { success: true, deletedCount: input.ids.length };
		}),

	setPassword: t.procedure
		.input(
			z.object({
				userId: z.string().min(1),
				newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Find the user's credential account
			const account = await ctx.prisma.account.findFirst({
				where: {
					userId: input.userId,
					providerId: 'credential',
				},
			});

			if (!account) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User does not have an email/password account',
				});
			}

			// Hash the password using scrypt (Better Auth uses scrypt by default)
			// Better Auth scrypt parameters: keylen=64, N=16384, r=8, p=1
			const salt = randomBytes(16);
			const keylen = 64;
			const N = 16384; // CPU/memory cost parameter
			const r = 8; // Block size parameter
			const p = 1; // Parallelization parameter

			const derivedKey = await new Promise<Buffer>((resolve, reject) => {
				scrypt(input.newPassword, salt as any, keylen, (err, derivedKey) => {
					if (err) {
						reject(err);
					} else {
						resolve(derivedKey);
					}
				});
			});

			// Format: scrypt$N$r$p$salt$hash (Better Auth format)
			const hashedPassword = `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;

			// Update the account password
			await ctx.prisma.account.update({
				where: { id: account.id },
				data: { password: hashedPassword },
			});

			return { success: true };
		}),
});
