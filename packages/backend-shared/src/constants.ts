/**
 * Backend shared constants
 */

/**
 * Default pagination size for backend services
 */
export const DEFAULT_PAGINATION_SIZE = 20;

/**
 * Maximum pagination size allowed
 */
export const MAX_PAGINATION_SIZE = 100;

/**
 * Default timeout for HTTP requests in milliseconds
 */
export const DEFAULT_HTTP_TIMEOUT_MS = 30000;

/**
 * Common HTTP status codes used across backend services
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Common error messages used across backend services
 */
export const ERROR_MESSAGES = {
	NOT_FOUND: 'Resource not found',
	UNAUTHORIZED: 'Unauthorized access',
	FORBIDDEN: 'Access forbidden',
	BAD_REQUEST: 'Invalid request',
	INTERNAL_ERROR: 'Internal server error',
	VALIDATION_ERROR: 'Validation failed',
} as const;
