// Notify background script that we're on kingdoms.com
chrome.runtime.sendMessage({ type: 'KINGDOMS_PAGE_LOADED' });

// Forward API response events from page (injected MAIN world) to background
document.addEventListener('__EXT_API_RESPONSE__', ((e: Event) => {
	const customEvent = e as CustomEvent;
	if (customEvent.detail) {
		const detail = customEvent.detail as { type: string } & Record<string, unknown>;
		const { type, ...payload } = detail;
		chrome.runtime.sendMessage({ type, ...payload });
	}
}) as EventListener);

// Intercept fetch requests to /api endpoints
const originalFetch = window.fetch;
window.fetch = async function (...args: Parameters<typeof fetch>) {
	const [url] = args;
	const urlString = typeof url === 'string' ? url : url.toString();

	// Only intercept /api requests
	if (urlString.includes('/api')) {
		const response = await originalFetch.apply(this, args);

		// Clone response to read it without consuming the original
		const clonedResponse = response.clone();

		// Read response body asynchronously
		(async () => {
			try {
				const text = await clonedResponse.text();

				if (text.length === 0) {
					return;
				}

				// Try to parse as JSON
				try {
					const json = JSON.parse(text);
					chrome.runtime.sendMessage({
						type: 'API_RESPONSE',
						url: urlString,
						status: response.status,
						statusText: response.statusText,
						data: json,
					});
				} catch {
					// Not JSON, send as text
					chrome.runtime.sendMessage({
						type: 'API_RESPONSE',
						url: urlString,
						status: response.status,
						statusText: response.statusText,
						data: text,
					});
				}
			} catch {
				// Silently ignore errors reading response
			}
		})();

		return response;
	}

	return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest for /api endpoints
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

interface XHRWithUrl extends XMLHttpRequest {
	_url?: string;
	_method?: string;
}

XMLHttpRequest.prototype.open = function (
	method: string,
	url: string | URL,
	async?: boolean,
	username?: string | null,
	password?: string | null,
) {
	(this as XHRWithUrl)._url = typeof url === 'string' ? url : url.toString();
	(this as XHRWithUrl)._method = method;
	return originalXHROpen.call(this, method, url, async ?? true, username, password);
};

XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
	const xhr = this as XHRWithUrl;
	if (xhr._url?.includes('/api')) {
		this.addEventListener('load', function () {
			const xhrLoaded = this as XHRWithUrl;
			try {
				const json = JSON.parse(this.responseText);
				chrome.runtime.sendMessage({
					type: 'API_RESPONSE',
					url: xhrLoaded._url,
					status: this.status,
					statusText: this.statusText,
					data: json,
				});
			} catch {
				chrome.runtime.sendMessage({
					type: 'API_RESPONSE',
					url: xhrLoaded._url,
					status: this.status,
					statusText: this.statusText,
					data: this.responseText,
				});
			}
		});
	}

	return originalXHRSend.call(this, body as XMLHttpRequestBodyInit | null | undefined);
};
