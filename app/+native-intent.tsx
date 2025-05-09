export function redirectSystemPath(options: { path: string }) {
	console.log("redirectSystemPath", options);
	// redirect all system links to the root path
	return "/";
}
