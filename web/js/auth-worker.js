"use strict";

importScripts("/js/external/argon2.umd.min.js");
importScripts("/js/external/idb-keyval.umd.js");
importScripts("/js/external/base64-arraybuffer.umd.js");
importScripts("/js/util.js");

const b64AB = self["base64-arraybuffer"];
const loginChallenge = "youperiod.app: login challenge";
const argonDefaultOptions = {
	iterations: 128,
	parallelism: 1,
	memorySize: 2048,
	hashLength: 32,
	outputType: "encoded",
};

self.addEventListener("message",onMessage,false);


// ****************************

async function onMessage({ data }) {
	if (data.createAuth) {
		await onCreateAuth(data.createAuth);
	}
	else if (data.checkAuth) {
		await onCheckAuth(data.checkAuth);
	}
}

function getKeyParams(account) {
	var keyInfo = account.keyInfo;
	return keyInfo ? {
		salt: keyInfo.salt,
		iterations: keyInfo.params.t,
		parallelism: keyInfo.params.p,
		memorySize: keyInfo.params.m,
	} : undefined;
}

async function getAccount(accountID) {
	var accounts = await idbKeyval.get("accounts");
	return accounts[accountID] || {};
}

async function setAccount(accountID,accountInfo) {
	var accounts = await idbKeyval.get("accounts");
	accounts[accountID] = accountInfo;
	await idbKeyval.set("accounts",accounts);
}

async function createLoginChallenge(account,password) {
	var keyParams = getKeyParams(account);
	var salt = (new TextEncoder()).encode(password);
	var key = await hashwasm.argon2id(Object.assign(
		{},
		argonDefaultOptions,
		keyParams || {},	// override options
		{
			password: loginChallenge,
			salt,
			outputType: "hex",
		}
	));
	return key;
}

async function createEncryptionKey(account,password) {
	var keyParams = getKeyParams(account);
	var salt = (
		(keyParams && keyParams.salt) ?
			new Uint8Array(b64AB.decode(keyParams.salt)) :
			self.crypto.getRandomValues(new Uint8Array(32))
	);
	var key = await hashwasm.argon2id(Object.assign(
		{},
		argonDefaultOptions,
		keyParams || {},	// override options
		{
			password: loginChallenge,
			salt,
		}
	));
	return parseArgon2(key);
}

async function onCreateAuth({ password, accountID, }) {
	try {
		let account = await getAccount(accountID);
		let [ loginChallengeHash, keyInfo, ] = await Promise.all([
			createLoginChallenge(account,password),
			createEncryptionKey(account,password),
		]);

		await setAccount(accountID,Object.assign(account,{
			loginChallenge: loginChallengeHash,
			keyInfo: {
				algorithm: keyInfo.algorithm,
				params: keyInfo.params,
				salt: keyInfo.salt,
				version: keyInfo.version,
			},
		}));

		self.postMessage({
			login: true,
			keyText: keyInfo.hash,
			accountID,
		});
	}
	catch (err) {
		console.log(err);

		self.postMessage({
			error: "Creating a local profile failed. Please try again.",
		});
	}
}

async function onCheckAuth({ password, accountID, }) {
	try {
		let account = await getAccount(accountID);
		let [
			loginAttemptHash,
			keyInfo,
		] = await Promise.all([
			createLoginChallenge(account,password),
			createEncryptionKey(account,password),
		]);

		if (account.loginChallenge === loginAttemptHash) {
			self.postMessage({
				login: true,
				keyText: keyInfo.hash,
				accountID,
			});
			return;
		}
	}
	catch (err) {
		console.log(err);
	}

	self.postMessage({
		error: "Login failed. Please try again.",
	});
}
