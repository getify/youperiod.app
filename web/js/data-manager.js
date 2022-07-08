import * as idbKeyval from "/js/external/idb-keyval.js";

export { getData, saveData, };

const b64AB = window["base64-arraybuffer"];
const aesDefaultOptions = {
	name: "AES-GCM",
};


// ****************************

async function getData(accountID,keyText) {
	try {
		accountID = accountID || sessionStorage.getItem("current-account-id");
		keyText = keyText || sessionStorage.getItem("current-key-text");
		let accounts = await idbKeyval.get("accounts");
		let account = accounts[accountID];

		if (account.data && account.dataIV) {
			let iv = b64AB.decode(account.dataIV);
			let keyBuffer = b64AB.decode(keyText);
			let key = await crypto.subtle.importKey("raw",keyBuffer,"AES-GCM",false,[ "decrypt", ]);
			let dataBuffer = b64AB.decode(account.data);
			let aesOptions = Object.assign({},aesDefaultOptions,{ iv, });
			dataBuffer = await crypto.subtle.decrypt(aesOptions,key,dataBuffer);
			return (new TextDecoder()).decode(dataBuffer);
		}
	}
	catch (err) {
		console.log(err);
	}
}

async function saveData(data,accountID,keyText,resaveWithNewCredentials = false) {
	try {
		accountID = accountID || sessionStorage.getItem("current-account-id");
		keyText = keyText || sessionStorage.getItem("current-key-text");
		let accounts = await idbKeyval.get("accounts");
		let account = accounts[accountID];

		let iv = new Uint8Array(16);
		self.crypto.getRandomValues(iv);
		account.dataIV = b64AB.encode(iv);
		let keyBuffer = b64AB.decode(keyText);
		let key = await crypto.subtle.importKey("raw",keyBuffer,"AES-GCM",false,[ "encrypt", ]);
		let dataBuffer = (new TextEncoder()).encode(data);
		let aesOptions = Object.assign({},aesDefaultOptions,{ iv, });
		let encData = await crypto.subtle.encrypt(aesOptions,key,dataBuffer);
		account.data = b64AB.encode(encData);

		// discard previous auth credentials now that
		// credentials change/upgrade is complete?
		if (resaveWithCredentials) {
			delete account.oldLoginChallenge;
			delete account.oldKeyInfo;
		}

		await idbKeyval.set("accounts",accounts);
		return true;
	}
	catch (err) {
		console.log(err);
	}

	return false;
}
