import type { AwilixContainer } from 'awilix';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { Container } from '../container';

// Zod schema pro validaci payloadu
const actionPayloadSchema = z.object({
	action: z.string().min(1, 'Action is required'),
	payload: z.unknown(), // payload může být libovolný typ
});

// Příklady specifických akcí s jejich payload schematy
const actionSchemas = {
	'game.units.update': z.object({
		action: z.literal('game.units.update'),
		payload: z.object({
			villages: z.array(
				z.object({
					villageId: z.string().min(1),
					units: z.array(z.number()),
				}),
			),
		}),
	}),
} as const;

type ActionType = keyof typeof actionSchemas;

export const registerApiRoutes = (fastifyServer: FastifyInstance, container: AwilixContainer<Container>): void => {
	fastifyServer.post('/api/event', async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			// Získání Prisma z Awilix containeru
			const prisma = container.cradle.prisma;

			// Validace tokenu z hlavičky
			const customTokenHeader = request.headers['x-token'] as string | undefined;

			if (!customTokenHeader) {
				return reply.status(401).send({ error: 'Token not provided' });
			}

			const dbToken = await prisma.token.findFirst({
				where: {
					token: customTokenHeader,
				},
			});

			if (!dbToken) {
				return reply.status(401).send({ error: 'Invalid token' });
			}

			// Validace body payloadu
			const bodyValidation = actionPayloadSchema.safeParse(request.body);

			if (!bodyValidation.success) {
				return reply.status(400).send({
					error: 'Invalid payload',
					details: bodyValidation.error.issues,
				});
			}

			const { action, payload } = bodyValidation.data;

			// Validace specifické akce (pokud existuje schema)
			if (action in actionSchemas) {
				const specificSchema = actionSchemas[action as ActionType];
				const specificValidation = specificSchema.safeParse({ action, payload });

				if (!specificValidation.success) {
					return reply.status(400).send({
						error: `Invalid payload for action '${action}'`,
						details: specificValidation.error.issues,
					});
				}
			}

			switch (action) {
				case 'game.units.update': {
					const validated = actionSchemas['game.units.update'].parse({ action, payload });

					// Najít GameAccount podle gamePlayerId a userId
					const gameAccount = await prisma.gameAccount.findFirst({
						where: {
							userId: dbToken.userId,
						},
					});

					if (!gameAccount) {
						return reply.status(404).send({
							error: 'Game account not found for this player',
						});
					}

					// Uložit všechny záznamy jednotek pomocí createMany
					if (validated.payload.villages.length > 0) {
						await prisma.gameAccountUnitRecord.createMany({
							data: validated.payload.villages.map(village => ({
								gameAccountId: gameAccount.id,
								villageId: village.villageId,
								units: village.units,
							})),
						});
					}

					break;
				}
				default:
					// Neznámá akce - přijmeme ji, ale bez specifické validace
					return reply.status(400).send({
						error: `Invalid payload for action '${action}'`,
					});
			}

			// Zaznamenání použití tokenu
			await prisma.tokenUsage.create({
				data: {
					tokenId: dbToken.id,
					usedAt: new Date(),
					ipAddress: request.ip,
					userAgent: request.headers['user-agent'],
				},
			});

			// Aktualizace lastUsedAt na tokenu
			await prisma.tokenUsage.update({
				where: { id: dbToken.id },
				data: { usedAt: new Date() },
			});

			return reply.status(200).send({
				success: true,
			});
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: error logging
			console.error('Error in API route:', error);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});
};
