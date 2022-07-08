import * as idbKeyval from "/js/external/idb-keyval.js";
import * as DataManager from "/js/data-manager.js";
import * as NotificationManager from "/js/notification-manager.js";

const UNSET = Symbol("unset");
var mainEl;
var createProfileFormEl;
var loginFormEl;
var savedDataFormEl;
var changePassphraseFormEl;
var profileNameSelectorEl;
var profileLabelEl;
var authWorker;
var tmpDataBackup = UNSET;

document.addEventListener("DOMContentLoaded",() => main().catch(console.log),false);


// ****************************

async function main() {
	mainEl = document.querySelector("main");
	createProfileFormEl = document.getElementById("create-profile");
	loginFormEl = document.getElementById("login");
	savedDataFormEl = document.getElementById("saved-data");
	changePassphraseFormEl = document.getElementById("change-secure-passphrase");
	profileNameSelectorEl = document.getElementById("profile-names");
	profileLabelEl = document.getElementById("profile-label");

	NotificationManager.init(mainEl);

	eventHandlers: {
		let createAnotherProfileBtn = document.getElementById("create-another-profile-btn");
		createAnotherProfileBtn.addEventListener("click",showRegistrationPage,false);

		let logoutBtn = document.getElementById("logout-btn");
		logoutBtn.addEventListener("click",onLogout,false);

		let changePassphraseBtn = document.getElementById("change-passphrase-btn");
		changePassphraseBtn.addEventListener("click",showChangePassphrasePage,false);

		let deleteProfileBtn = document.getElementById("delete-profile-btn");
		deleteProfileBtn.addEventListener("click",onStartDeleteProfile,false);

		createProfileFormEl.addEventListener("submit",onCreateProfile,false);
		loginFormEl.addEventListener("submit",onLogin,false);
		savedDataFormEl.addEventListener("submit",onSaveData,false);
		changePassphraseFormEl.addEventListener("submit",onChangePassphrase,false);
	}

	authWorker = new Worker("/js/auth-worker.js");
	authWorker.addEventListener("message",onAuthMessage,false);

	loadProfiles: {
		let profiles = await getProfiles();
		populateProfileSelector(profiles);
	}

	// no registered login(s) yet?
	if (profileNameSelectorEl.options.length == 0) {
		showRegistrationPage();
	}
	else {
		let accountID = sessionStorage.getItem("current-account-id");
		let keyText = sessionStorage.getItem("current-key-text");

		// already logged in?
		if (accountID && keyText) {
			await showSavedDataPage();
		}
		else {
			showLoginPage();
		}
	}
}

async function getProfiles() {
	var profiles = await idbKeyval.get("profiles");
	return profiles || {};
}

async function getAccounts() {
	var accounts = await idbKeyval.get("accounts");
	return accounts || {};
}

async function addProfileAccount(profileName,accountID) {
	var [ profiles, accounts, ] = await Promise.all([
		getProfiles(),
		getAccounts(),
	]);

	if (!(profileName in profiles)) {
		profiles[profileName] = accountID;
		accounts[accountID] = { profileName, };
		try {
			await Promise.all([
				idbKeyval.set("profiles",profiles),
				idbKeyval.set("accounts",accounts),
			]);
			populateProfileSelector(profiles);
			return true;
		}
		catch (err) {}
	}
	return false;
}

async function deleteProfile(accountID) {
	var [ profiles, accounts, ] = await Promise.all([
		getProfiles(),
		getAccounts(),
	]);

	let { profileName, } = accounts[accountID];
	delete profiles[profileName];
	delete accounts[accountID];

	try {
		await Promise.all([
			idbKeyval.set("profiles",profiles),
			idbKeyval.set("accounts",accounts),
		]);
		return true;
	}
	catch (err) {}
	return false;
}

function populateProfileSelector(profiles) {
	profileNameSelectorEl.options.length = 0;
	let profileList = Object.entries(profiles).sort((p1,p2) => (
		(p1[0] < p2[0]) ? -1 :
		(p1[0] > p2[0]) ? 1 :
		0
	));

	for (let [ profileName, accountID, ] of profileList) {
		let optEl = document.createElement("option");
		optEl.value = accountID;
		optEl.innerText = profileName;
		profileNameSelectorEl.appendChild(optEl);
	}
}

async function populateSavedData() {
	setProfileName: {
		let accounts = await getAccounts();
		let accountID = sessionStorage.getItem("current-account-id");
		let account = accounts[accountID];
		profileLabelEl.innerText = account.profileName;
	}

	setSavedData: {
		let textareaEl = savedDataFormEl.querySelector("#saved-text");
		let data = await DataManager.getData();
		textareaEl.value = (data != null) ? data : "";
	}
}

async function onCreateProfile(evt) {
	cancelEvent(evt);

	var submitBtn = createProfileFormEl.querySelector("button[type=submit]");

	if (!(
		createProfileFormEl.classList.contains("hidden") ||
		submitBtn.disabled
	)) {
		let profileNameEl = createProfileFormEl.querySelector("#register-profile-name");
		let passphraseEl = createProfileFormEl.querySelector("#register-password");
		let confirmPassphraseEl = createProfileFormEl.querySelector("#register-password-confirm");
		if (profileNameEl.value.length < 2) {
			warn("Please enter a profile name/description at least 2 characters long.");
			return false;
		}
		if (passphraseEl.value.length < 12) {
			warn("Please enter a passphrase at least 12 characters long.");
			return false;
		}
		if (passphraseEl.value !== confirmPassphraseEl.value) {
			warn("Please make sure you enter the exact same passphrase twice.");
			return false;
		}

		let accountID = self.crypto.randomUUID();
		if (!(await addProfileAccount(profileNameEl.value,accountID))) {
			warn("Could not add a profile with the given name/description.");
			return false;
		}

		let password = passphraseEl.value.trim();
		passphraseEl.value = "";
		confirmPassphraseEl.value = "";

		notify("Creating profile and credentials, please wait...");

		submitBtn.disabled = true;
		authWorker.postMessage({
			createAuth: {
				password,
				accountID,
			},
		});
	}
}

async function onLogin(evt) {
	cancelEvent(evt);

	var submitBtn = loginFormEl.querySelector("button[type=submit]");

	if (!(
		loginFormEl.classList.contains("hidden") ||
		submitBtn.disabled
	)) {
		let accountID = profileNameSelectorEl.value;
		let passphraseEl = loginFormEl.querySelector("#login-password");
		let password = passphraseEl.value.trim();
		passphraseEl.value = "";

		if (password.length < 12) {
			warn("Please login with a passphrase at least 12 characters long.");
			return false;
		}

		notify("Please wait...");

		submitBtn.disabled = true;
		authWorker.postMessage({
			checkAuth: {
				password,
				accountID,
			},
		});
	}
}

async function onLogout(evt = false) {
	if (evt) {
		cancelEvent(evt);
	}
	NotificationManager.hide();
	createProfileFormEl.reset();
	loginFormEl.reset();
	savedDataFormEl.reset();
	profileLabelEl.innerText = "";
	sessionStorage.clear();
	location.reload();
}

async function onSaveData(evt) {
	cancelEvent(evt);

	var submitBtn = savedDataFormEl.querySelector("button[type=submit]");

	if (!(
		savedDataFormEl.classList.contains("hidden") ||
		submitBtn.disabled
	)) {
		submitBtn.disabled = true;
		let textareaEl = savedDataFormEl.querySelector("#saved-text");
		try {
			let res = await DataManager.saveData(textareaEl.value);
			if (res) {
				notify("Data saved (encrypted) successfully.");
			}
			if (!res) {
				throw res;
			}
		}
		catch (err) {
			console.log(err);
			warn("Saving data failed. Please try again.");
		}

		submitBtn.disabled = false;
	}
}

function onChangePassphrase(evt) {
	cancelEvent(evt);

	var submitBtn = changePassphraseFormEl.querySelector("button[type=submit]");

	if (!(
		changePassphraseFormEl.classList.contains("hidden") ||
		submitBtn.disabled
	)) {
		let accountID = sessionStorage.getItem("current-account-id");
		let oldPassphraseEl = changePassphraseFormEl.querySelector("#change-old-password");
		let newPassphraseEl = changePassphraseFormEl.querySelector("#change-password");
		let confirmPassphraseEl = changePassphraseFormEl.querySelector("#change-password-confirm");

		if (oldPassphraseEl.value.length < 12) {
			warn("Please enter a current passphrase at least 12 characters long.");
			return false;
		}
		if (newPassphraseEl.value.length < 12) {
			warn("Please enter a new passphrase at least 12 characters long.");
			return false;
		}
		if (newPassphraseEl.value !== confirmPassphraseEl.value) {
			warn("Please make sure you enter the exact same passphrase twice.");
			return false;
		}

		let oldPassword = oldPassphraseEl.value.trim();
		let newPassword = newPassphraseEl.value.trim();
		oldPassphraseEl.value = "";
		newPassphraseEl.value = "";
		confirmPassphraseEl.value = "";

		notify("Please wait...");

		submitBtn.disabled = true;
		authWorker.postMessage({
			changeAuth: {
				oldPassword,
				newPassword,
				accountID,
			},
		});
	}
}

function onStartDeleteProfile(evt) {
	cancelEvent(evt);

	NotificationManager.show(
		"Warning: This will PERMANENTLY DELETE ALL your saved data. Continue?",
		/*isModal=*/true,
		/*isError=*/false,
		/*showCancel=*/true,
		onClose
	);


	// ***************************

	async function onClose(result) {
		// confirmed profile delete?
		if (result === true) {
			let accountID = sessionStorage.getItem("current-account-id");
			let res = await deleteProfile(accountID);
			if (res) {
				onLogout();
			}
			else {
				warn("Deleting the profile FAILED!! Please try again.");
			}
		}
		// canceled the profile deletion
		else {
			await delay(250);
			notify("Phew, glad we didn't accidentally delete your data!");
		}
	}
}

function showRegistrationPage() {
	hideLoginPage();
	hideSavedDataPage();
	hideChangePassphrasePage();

	createProfileFormEl.removeAttribute("inert");
	createProfileFormEl.reset();
	var submitBtn = createProfileFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = false;
	createProfileFormEl.classList.remove("hidden");
}

function hideRegistrationPage() {
	createProfileFormEl.classList.add("hidden");
	createProfileFormEl.setAttribute("inert","inert");
	createProfileFormEl.reset();
	var submitBtn = createProfileFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = true;
}

function showLoginPage() {
	hideRegistrationPage();
	hideSavedDataPage();
	hideChangePassphrasePage();

	loginFormEl.removeAttribute("inert");
	loginFormEl.reset();
	var submitBtn = loginFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = false;
	var createAnotherProfileBtn = document.getElementById("create-another-profile-btn");
	createAnotherProfileBtn.disabled = false;
	loginFormEl.classList.remove("hidden");
	var passphraseEl = loginFormEl.querySelector("#login-password");
	passphraseEl.focus();
}

function hideLoginPage() {
	loginFormEl.classList.add("hidden");
	loginFormEl.setAttribute("inert","inert");
	loginFormEl.reset();
	var submitBtn = loginFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = true;
	var createAnotherProfileBtn = document.getElementById("create-another-profile-btn");
	createAnotherProfileBtn.disabled = true;
}

async function showSavedDataPage() {
	hideLoginPage();
	hideRegistrationPage();
	hideChangePassphrasePage();

	savedDataFormEl.reset();
	await populateSavedData();
	savedDataFormEl.classList.remove("hidden");
	savedDataFormEl.removeAttribute("inert");
	var submitBtn = savedDataFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = false;
}

function hideSavedDataPage() {
	savedDataFormEl.classList.add("hidden");
	savedDataFormEl.setAttribute("inert","inert");
	var submitBtn = savedDataFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = true;
}

function showChangePassphrasePage() {
	hideLoginPage();
	hideRegistrationPage();
	hideSavedDataPage();

	changePassphraseFormEl.reset();
	changePassphraseFormEl.classList.remove("hidden");
	changePassphraseFormEl.removeAttribute("inert");
	var submitBtn = changePassphraseFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = false;
}

function hideChangePassphrasePage() {
	changePassphraseFormEl.classList.add("hidden");
	changePassphraseFormEl.setAttribute("inert","inert");
	var submitBtn = changePassphraseFormEl.querySelector("button[type=submit]");
	submitBtn.disabled = true;
}

function notify(msg,isModal = false) {
	NotificationManager.show(msg,isModal,/*isError=*/false);
}

function warn(msg,isModal = true) {
	NotificationManager.show(msg,isModal,/*isError=*/true);
}

// *******************************

async function onAuthMessage({ data }) {
	if (data.login === true) {
		// upgrade/change of auth credentials pending?
		if (data.upgradePending || data.changePending) {
			// decrypt/extract current data
			tmpDataBackup = await DataManager.getData(
				data.accountID,
				data.keyText,
			);

			// trigger regeneration of new auth credentials
			authWorker.postMessage({
				createAuth: {
					password: data.password,
					accountID: data.accountID,
					regenerate: true,
				},
			});

			notify(
				data.upgradePending ? "Upgrading data encryption, please wait..." :
				data.changePending ? "Re-encrypting data with new credentials, please wait..." :
				"Please wait..."
			);
			return;
		}
		// auth credentials regenerated?
		else if (data.authRegenerated && tmpDataBackup !== UNSET) {
			try {
				// re-save the data using the upgraded
				// encryption credentials
				let res = await DataManager.saveData(
					tmpDataBackup,
					data.accountID,
					data.keyText,
					/*resaveWithNewCredentials=*/true
				);
				if (!res) {
					throw "Save failed.";
				}
				tmpDataBackup = UNSET;
			}
			catch (err) {
				console.log(err);

				// login page is active?
				if (!loginFormEl.classList.contains("hidden")) {
					warn("Re-saving data (during credentials upgrade) failed. Please login again.");

					let submitBtn = loginFormEl.querySelector("button[type=submit]");
					submitBtn.disabled = false;
				}
				// change-passphrase page is active?
				else if (!changePassphraseFormEl.classList.contains("hidden")) {
					warn("Re-saving data (during credentials change) failed. Please try again.");

					let submitBtn = changePassphraseFormEl.querySelector("button[type=submit]");
					submitBtn.disabled = false;
				}
				return;
			}
		}

		// need to save credentials into session?
		sessionStorage.setItem("current-account-id",data.accountID);
		sessionStorage.setItem("current-key-text",data.keyText);

		// passphrase credentials changed?
		let credentialsChanged = (
			data.authRegenerated &&
			!changePassphraseFormEl.classList.contains("hidden")
		);

		NotificationManager.hide();
		await showSavedDataPage();

		// new local profile created?
		if (data.credentialsCreated) {
			notify(
				"Local profile created successfully, you're now logged in!",
				/*isModal=*/true
			);
		}
		// passphrase credentials changed?
		else if (credentialsChanged) {
			notify("Passphrase changed successfully!");
		}
	}
	else if (data.error) {
		let submitBtns = document.querySelectorAll("form button[type=submit]");
		for (let btn of submitBtns) {
			btn.disabled = false;
		}
		warn(data.error);
	}
}
