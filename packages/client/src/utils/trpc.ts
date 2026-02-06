// eslint-disable-next-line import/no-relative-packages
import type { AppRouter } from '@t/bff/src/trpc/router';
import { httpLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { getApiUrl } from './apiUrl';

export type { AppRouter };
export const trpc = createTRPCReact<AppRouter>({});

export type RouterOutput = inferRouterOutputs<AppRouter>;

const BASE_API = getApiUrl();

export const trpcClient = trpc.createClient({
	transformer: superjson,
	links: [
		httpLink({
			url: `${BASE_API}/trpc`,
			fetch: (url, options) => {
				return fetch(url, {
					...options,
					credentials: 'include',
				});
			},
		}),
	],
});
