console.log("✅ Content script loaded on kingdoms.com");

// Notify background script that we're on kingdoms.com
chrome.runtime.sendMessage({ type: "KINGDOMS_PAGE_LOADED" });

// Intercept fetch requests to /api endpoints
const originalFetch = window.fetch;
window.fetch = async function(...args: Parameters<typeof fetch>) {
	const [url, options] = args;
	const urlString = typeof url === "string" ? url : url.toString();
	
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
			const clonedResponse = response.clone();
			
			// Try to parse as JSON
			try {
				const json = await clonedResponse.json();
				console.log("📥 API RESPONSE JSON:", {
					url: urlString,
					status: response.status,
					statusText: response.statusText,
					data: json,
				});
			} catch (e) {
				// Not JSON, log as text
				const text = await clonedResponse.text();
				console.log("📥 API RESPONSE TEXT:", {
					url: urlString,
					status: response.status,
					statusText: response.statusText,
					data: text,
				});
			}
			
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

XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
	(this as XHRWithUrl)._url = typeof url === "string" ? url : url.toString();
	(this as XHRWithUrl)._method = method;
	return originalXHROpen.apply(this, [method, url, ...rest]);
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
	
	return originalXHRSend.apply(this, [body]);
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
