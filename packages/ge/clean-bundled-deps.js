// Automatically remove all directories in dist/code/ after bundling
// because all dependencies are bundled into background.js
const fs = require("fs");
const path = require("path");

const distCodeDir = path.join(__dirname, "dist", "code");

if (fs.existsSync(distCodeDir)) {
	const entries = fs.readdirSync(distCodeDir, { withFileTypes: true });
	const entryPoints = new Set(["background.js", "content.js", "main.js"]);
	
	for (const entry of entries) {
		if (entry.isDirectory()) {
			// Remove all directories - they're bundled dependencies
			const rimraf = require("rimraf");
			rimraf.sync(path.join(distCodeDir, entry.name));
		} else if (entry.isFile() && !entryPoints.has(entry.name)) {
			// Remove any other JS files that aren't entry points
			// (these would be unbundled dependencies)
			if (entry.name.endsWith(".js")) {
				fs.unlinkSync(path.join(distCodeDir, entry.name));
			}
		}
	}
}
