/**
 * Returns the base API URL based on the current environment.
 * On localhost, returns http://localhost:3334
 * Otherwise, returns the same URL as the current page (same origin)
 */
export const getApiUrl = (): string => {
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
