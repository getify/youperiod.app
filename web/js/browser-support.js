function webAssemblySupported() {
	return "WebAssembly" in window
		&& typeof window.WebAssembly.instantiate === "function";
}

function serviceWorkersSupported() {
	return "serviceWorker" in navigator;
}

function webWorkersSupported() {
	return "Worker" in window;
}

function indexedDbSupported() {
	return "indexedDB" in window
		&& typeof window.indexedDB.open === "function";
}

function sessionStorageSupported() {
	return "sessionStorage" in window
		&& typeof window.sessionStorage.setItem === "function";
}

function webCryptoSupported() {
	return "crypto" in window
		&& typeof window.crypto.randomUUID === "function";
}

function textEncodeDecodeSupported() {
	return "TextEncoder" in window && "TextDecoder" in window;
}

function storeManagerPersistSupported() {
	return "storage" in window.navigator
		&& typeof window.navigator.storage.persist === "function";
}

function notificationApiSupported() {
	return "Notification" in window;
}

function credentialsContainerSupported() {
	return "credentials" in window.navigator
		&& typeof window.navigator.credentials.get === "function";
}

function getUserMediaSupported() {
	return "mediaDevices" in window.navigator
		&& typeof window.navigator.mediaDevices.getUserMedia === "function";
}

function minimumFeaturesSupported() {
	return (
		webAssemblySupported()
		&& serviceWorkersSupported()
		&& webWorkersSupported()
		&& indexedDbSupported()
		&& sessionStorageSupported()
		&& webCryptoSupported()
		&& textEncodeDecodeSupported()
		&& storeManagerPersistSupported()
	);
}

function optionalFeaturesSupported() {
	return (
		notificationApiSupported()
		&& credentialsContainerSupported()
		&& getUserMediaSupported()
	);
}

export { minimumFeaturesSupported, optionalFeaturesSupported };
