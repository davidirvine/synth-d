//#region src/lib/stubs/url.js
/** @param {string} path */
function pathToFileURL(path) {
	return new URL("file://" + path);
}
var URL = globalThis.URL;
globalThis.URLSearchParams;
//#endregion
export { pathToFileURL };
