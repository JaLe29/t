import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import type { Auth } from '../auth';

export const registerAuthRoutes = (fastifyServer: FastifyInstance, auth: Auth, prisma: PrismaClient): void => {
	// Register Better Auth routes
	fastifyServer.all('/api/auth/*', async (request, reply) => {
		try {
			const url = new URL(request.url, `http://${request.headers.host || 'localhost:3334'}`);

			// Convert Fastify headers to Headers object
			const headers = new Headers();
			for (const [key, value] of Object.entries(request.headers)) {
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

			// Get body - Fastify already parses JSON, but we need to stringify it for Better Auth
			let bodyString: string | null = null;
			let emailFromBody: string | null = null;
			if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
				// Fastify automatically parses JSON, so we need to stringify it back
				if (typeof request.body === 'object') {
					bodyString = JSON.stringify(request.body);
					// Získáme email z request body pro případné logování neúspěšného pokusu
					emailFromBody = (request.body as { email?: string })?.email || null;
				} else if (typeof request.body === 'string') {
					bodyString = request.body;
					// Zkusíme získat email i ze stringu
					try {
						const parsedBody = JSON.parse(request.body);
						emailFromBody = parsedBody.email || null;
					} catch {
						// Pokud parsování selže, pokračujeme bez emailu
					}
				}
			}

			const authRequest = new Request(
				`http://${request.headers.host || 'localhost:3334'}${url.pathname}${url.search}`,
				{
					method: request.method,
					headers,
					body: bodyString,
				},
			);

			const response = await auth.handler(authRequest);

			// Logování neúspěšných pokusů o přihlášení
			if (url.pathname.startsWith('/api/auth/sign-in/email') && response.status >= 400) {
				try {
					// Získáme IP adresu a User-Agent z request headers
					const ipAddress =
						(request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
						(request.headers['x-real-ip'] as string | undefined) ||
						request.ip ||
						null;
					const userAgent = (request.headers['user-agent'] as string | undefined) || null;

					// Zkusíme získat důvod z response
					let reason: string | null = null;
					try {
						const responseText = await response.clone().text();
						const responseData = JSON.parse(responseText);
						if (responseData?.error) {
							reason = responseData.error.message || responseData.error || null;
						}
					} catch {
						// Pokud parsování selže, použijeme status code jako důvod
						reason = `HTTP ${response.status}`;
					}

					// Zalogujeme neúspěšný pokus
					await prisma.failedLoginAttempt.create({
						data: {
							email: emailFromBody || null,
							ipAddress: ipAddress || null,
							userAgent: userAgent || null,
							reason: reason || 'Invalid credentials',
						},
					});
				} catch (error) {
					// Pokud se logování nepovede, nechceme přerušit běh aplikace
					// biome-ignore lint/suspicious/noConsole: error logging
					console.error('Error logging failed login attempt:', error);
				}
			}

			// Set status and headers
			reply.status(response.status);
			response.headers.forEach((value, key) => {
				reply.header(key, value);
			});

			// Ensure CORS headers are set
			const origin = request.headers.origin;
			if (origin) {
				reply.header('Access-Control-Allow-Origin', origin);
				reply.header('Access-Control-Allow-Credentials', 'true');
			}

			// Send response body
			const responseBody = await response.text();
			return reply.send(responseBody || undefined);
		} catch (_error) {
			reply.status(500).send({ error: 'Internal server error' });
		}
	});

	// Register user photo endpoint
	fastifyServer.get('/image/user-photo/:id', async (request, reply) => {
		try {
			// Check authentication
			const headers = new Headers();
			for (const [key, value] of Object.entries(request.headers)) {
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

			const session = await auth.api.getSession({ headers });

			if (!session || !session.user) {
				reply.status(401).send({ error: 'Unauthorized' });
				return;
			}

			// Get user ID from params
			const userId = (request.params as { id: string }).id;

			// Fetch user photo from database
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { photo: true },
			});

			if (!user || !user.photo) {
				reply.status(404).send({ error: 'Photo not found' });
				return;
			}

			// Extract content type from base64 data URL
			const base64Match = user.photo.match(/^data:image\/([^;]+);base64,/);
			const contentType = base64Match ? `image/${base64Match[1]}` : 'image/png';

			// Extract base64 data (remove data:image/...;base64, prefix)
			const base64Data = user.photo.replace(/^data:image\/[^;]+;base64,/, '');

			// Convert base64 to buffer
			const imageBuffer = Buffer.from(base64Data, 'base64');

			// Set headers
			reply.type(contentType);
			reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

			// Ensure CORS headers are set
			const origin = request.headers.origin;
			if (origin) {
				reply.header('Access-Control-Allow-Origin', origin);
				reply.header('Access-Control-Allow-Credentials', 'true');
			}

			// Send image as buffer
			return reply.send(imageBuffer);
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: error logging
			console.error('Error fetching user photo:', error);
			reply.status(500).send({ error: 'Internal server error' });
		}
	});
};
