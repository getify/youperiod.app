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
	else if (data.changeAuth) {
		await onChangeAuth(data.changeAuth);
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
			password,
			salt,
		}
	));
	return parseArgon2(key);
}

async function onCreateAuth({
	password,
	accountID,
	regenerate = false,
}) {
	try {
		let account = await getAccount(accountID);

		// save old auth credentials in case we're regenerating
		let {
			loginChallenge: oldLoginChallenge,
			keyInfo: oldKeyInfo,
		} = account;
		if (regenerate) {
			account.loginChallenge = null;
			account.keyInfo = null;
		}

		// generate new auth credentials
		let [ loginChallengeHash, keyInfo, ] = await Promise.all([
			createLoginChallenge(account,password),
			createEncryptionKey(account,password),
		]);

		// store new auth credentials in account
		await setAccount(accountID,Object.assign(account,{
			loginChallenge: loginChallengeHash,
			keyInfo: {
				algorithm: keyInfo.algorithm,
				params: keyInfo.params,
				salt: keyInfo.salt,
				version: keyInfo.version,
			},

			// preserve old credentials temporarily just in case
			// upgrade of data encryption doesn't complete
			...(regenerate ? { oldLoginChallenge, oldKeyInfo, } : {}),
		}));

		// notify page of new credentials
		self.postMessage({
			login: true,
			credentialsCreated: (!regenerate),
			keyText: keyInfo.hash,
			accountID,
			...(regenerate ? { authRegenerated: true, } : {})
		});
	}
	catch (err) {
		console.log(err);

		if (regenerate) {
			self.postMessage({
				error: "Regenerating credentials failed. Please try again.",
			});
		}
		else {
			self.postMessage({
				error: "Creating a local profile failed. Please try again.",
			});
		}
	}
}

async function onCheckAuth({ password, accountID, }) {
	try {
		let account = await getAccount(accountID);

		// did a previous credentials upgrade/change
		// fail to complete for some reason?
		if (account.oldLoginChallenge && account.oldKeyInfo) {
			// roll-back previous upgrade/change
			//
			// note: if upgrade is still necessary,
			// will reattempt below
			account.loginChallenge = account.oldLoginChallenge;
			account.keyInfo = account.oldKeyInfo;
			delete account.oldLoginChallenge;
			delete account.oldKeyInfo;
			await setAccount(accountID,account);
		}

		let [
			loginAttemptHash,
			keyInfo,
		] = await Promise.all([
			createLoginChallenge(account,password),
			createEncryptionKey(account,password),
		]);

		// did the login match?
		if (account.loginChallenge === loginAttemptHash) {
			// any crypto params have changed?
			if (
				argonDefaultOptions.iterations !== keyInfo.params.t ||
				argonDefaultOptions.parallelism !== keyInfo.params.p ||
				argonDefaultOptions.memorySize !== keyInfo.params.m
			) {
				// send login message for old auth info
				// allowing data to be extracted
				self.postMessage({
					login: true,
					keyText: keyInfo.hash,
					accountID,
					password,
					upgradePending: true,
				});
			}
			else {
				self.postMessage({
					login: true,
					keyText: keyInfo.hash,
					accountID,
				});
			}

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

async function onChangeAuth({ oldPassword, newPassword, accountID, }) {
	try {
		let account = await getAccount(accountID);

		// did a previous credentials upgrade/change
		// fail to complete for some reason?
		if (account.oldLoginChallenge && account.oldKeyInfo) {
			// roll-back previous upgrade/change
			//
			// note: if upgrade is still necessary,
			// will reattempt below
			account.loginChallenge = account.oldLoginChallenge;
			account.keyInfo = account.oldKeyInfo;
			delete account.oldLoginChallenge;
			delete account.oldKeyInfo;
			await setAccount(accountID,account);
		}

		let [
			loginAttemptHash,
			keyInfo,
		] = await Promise.all([
			createLoginChallenge(account,oldPassword),
			createEncryptionKey(account,oldPassword),
		]);

		// did the login match?
		if (account.loginChallenge === loginAttemptHash) {
			// send login message for old auth info
			// allowing data to be extracted
			self.postMessage({
				login: true,
				keyText: keyInfo.hash,
				accountID,
				password: newPassword,
				changePending: true,
			});
		}
	}
	catch (err) {
		console.log(err);
	}

	self.postMessage({
		error: "Passphrase change failed. Please try again.",
	});
}
