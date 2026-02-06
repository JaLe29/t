import { createAuthClient } from 'better-auth/react';
import { getApiUrl } from './apiUrl';

export const authClient = createAuthClient({
	baseURL: getApiUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
