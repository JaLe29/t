/**
 * Returns the base API URL based on the current environment.
 * On localhost, returns http://localhost:3335
 * Otherwise, returns the same URL as the current page (same origin)
 */
export const getApiUrl = (): string => {
	if (typeof window === 'undefined') {
		return 'http://localhost:3335';
	}

	// On localhost, use localhost:3335
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
		return 'http://localhost:3335';
	}

	// Otherwise, use the same origin as the current page
	return `${window.location.protocol}//${window.location.host}`;
};
