//#region src/lib/stubs/fs.js
var promises = {
	readFile: async () => {
		throw new Error("fs.promises.readFile is not available in the browser");
	},
	writeFile: async () => {
		throw new Error("fs.promises.writeFile is not available in the browser");
	},
	access: async () => {
		throw new Error("fs.promises.access is not available in the browser");
	}
};
//#endregion
export { promises };
