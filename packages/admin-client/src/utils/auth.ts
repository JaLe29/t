import { createAuthClient } from 'better-auth/react';

/**
 * Admin client uses auth from main BFF (port 3334), not admin-bff
 */
const getMainBffUrl = (): string => {
	if (typeof window === 'undefined') {
		return 'http://localhost:3334';
	}

	// On localhost, use localhost:3334
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
		return 'http://localhost:3334';
	}

	// Otherwise, use the same origin as the current page
	return `${window.location.protocol}//${window.location.host}`;
};

export const authClient = createAuthClient({
	baseURL: getMainBffUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
