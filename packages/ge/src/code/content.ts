console.log("✅ Content script loaded on kingdoms.com");

// Notify background script that we're on kingdoms.com
chrome.runtime.sendMessage({ type: "KINGDOMS_PAGE_LOADED" });

// Forward API response events from page (injected MAIN world) to background
document.addEventListener("__EXT_API_RESPONSE__", ((e: Event) => {
	const customEvent = e as CustomEvent;
	if (customEvent.detail) {
		const detail = customEvent.detail as { type: string } & Record<string, unknown>;
		const { type, ...payload } = detail;
		chrome.runtime.sendMessage({ type, ...payload });
	}
}) as EventListener);

// Intercept fetch requests to /api endpoints
const originalFetch = window.fetch;
window.fetch = async function(...args: Parameters<typeof fetch>) {
	const [url, options] = args;
	const urlString = typeof url === "string" ? url : url.toString();
	
	console.log("🔍 Fetch called:", urlString);

	// Only intercept /api requests
	if (urlString.includes("/api")) {
		console.log("🌐 API FETCH REQUEST:", {
			url: urlString,
			method: options?.method || "GET",
			headers: options?.headers,
			body: options?.body,
		});

		try {
			const response = await originalFetch.apply(this, args);
			console.log("✅ Response received:", {
				url: urlString,
				status: response.status,
				ok: response.ok,
				headers: Object.fromEntries((response.headers as any).entries() as [string, string][]),
			});

			// Clone response to read it without consuming the original
			const clonedResponse = response.clone();

			// Read response body asynchronously
			(async () => {
				try {
					const contentType = response.headers.get("content-type") || "";
					console.log("📋 Reading response body, content-type:", contentType);

					// Always try to read as text first, then parse if JSON
					const text = await clonedResponse.text();
					console.log("📄 Response text length:", text.length);

					if (text.length === 0) {
						console.log("⚠️ Response body is empty");
						return;
					}

					// Try to parse as JSON
					try {
						const json = JSON.parse(text);
						console.log("📥 API RESPONSE JSON:", {
							url: urlString,
							status: response.status,
							statusText: response.statusText,
							data: json,
						});

						if (json.cache) {
							for (const cache of json.cache) {
								console.log("📦 CACHE:", cache);
							}
						}
					} catch (parseError) {
						// Not JSON, log as text
						console.log("📥 API RESPONSE TEXT:", {
							url: urlString,
							status: response.status,
							statusText: response.statusText,
							contentType: contentType,
							data: text.substring(0, 500), // Limit to first 500 chars
						});
					}
				} catch (e) {
					console.error("❌ ERROR READING RESPONSE:", {
						url: urlString,
						error: e,
						errorMessage: e instanceof Error ? e.message : String(e),
						status: response.status,
					});
				}
			})();

			return response;
		} catch (error) {
			console.error("❌ API REQUEST ERROR:", { url: urlString, error });
			throw error;
		}
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

XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
	(this as XHRWithUrl)._url = typeof url === "string" ? url : url.toString();
	(this as XHRWithUrl)._method = method;
	return originalXHROpen.call(this, method, url, async ?? true, username, password);
};

XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
	const xhr = this as XHRWithUrl;
	if (xhr._url && xhr._url.includes("/api")) {
		console.log("🌐 API XHR REQUEST:", {
			url: xhr._url,
			method: xhr._method || "GET",
			body: body,
		});

		this.addEventListener("load", function() {
			const xhrLoaded = this as XHRWithUrl;
			try {
				const json = JSON.parse(this.responseText);
				console.log("📥 API XHR RESPONSE JSON:", {
					url: xhrLoaded._url,
					status: this.status,
					statusText: this.statusText,
					data: json,
				});
			} catch (e) {
				console.log("📥 API XHR RESPONSE TEXT:", {
					url: xhrLoaded._url,
					status: this.status,
					statusText: this.statusText,
					data: this.responseText,
				});
			}
		});

		this.addEventListener("error", function() {
			const xhrError = this as XHRWithUrl;
			console.error("❌ API XHR ERROR:", {
				url: xhrError._url,
				status: this.status,
			});
		});
	}

	// Type assertion for body parameter
	return originalXHRSend.call(this, body as XMLHttpRequestBodyInit | null | undefined);
};

// Your code that runs on kingdoms.com pages
function init() {
	console.log("✅ Extension initialized on kingdoms.com - page URL:", window.location.href);

	// Add visual indicator that extension is active
	const indicator = document.createElement("div");
	indicator.id = "extension-indicator";
	indicator.style.cssText = `
		position: fixed;
		top: 10px;
		right: 10px;
		background: #4CAF50;
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 12px;
		z-index: 999999;
		font-family: Arial, sans-serif;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	`;
	indicator.textContent = "Extension Active";
	document.body.appendChild(indicator);

	// Remove indicator after 3 seconds
	setTimeout(() => {
		if (indicator.parentNode) {
			indicator.remove();
		}
	}, 3000);

	// Add your logic here
}

// Run when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
