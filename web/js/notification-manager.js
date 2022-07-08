export { init, show, hide, };

const AUTO_DISMISS_DELAY = 5000;
var mainEl;
var bannerEl;
var formEl;
var msgEl;
var btnEl;
var autoDismissTimer;


// ****************************

function init(mainDOMElement) {
	mainEl = mainDOMElement;
	bannerEl = document.getElementById("notification-banner");
	formEl = bannerEl.querySelector("form");
	msgEl = bannerEl.querySelector(".msg");
	btnEl = bannerEl.querySelector("button[type=submit]");

	formEl.addEventListener("submit",onFormSubmit,false);
}

function show(msg,isModal = false,isError = false) {
	// banner already shown?
	if (!bannerEl.classList.contains("hidden")) {
		hide();
	}

	if (isError) {
		bannerEl.classList.add("error");
	}
	else {
		bannerEl.classList.remove("error");
	}
	msgEl.innerText = msg;
	bannerEl.classList.remove("hidden");
	msgEl.setAttribute("aria-live","polite");

	bannerEl.addEventListener("click",clearAutoDismissTimer,true);

	if (isModal) {
		btnEl.classList.remove("hidden");
		mainEl.setAttribute("inert","inert");
		mainEl.addEventListener("click",cancelEvent,true);
		mainEl.addEventListener("keydown",cancelEvent,true);
		btnEl.focus();
	}
	else {
		btnEl.classList.add("hidden");
		if (autoDismissTimer) {
			clearTimeout(autoDismissTimer);
		}
		autoDismissTimer = setTimeout(() => dismiss(),AUTO_DISMISS_DELAY);
		document.addEventListener("click",dismiss,true);
		document.addEventListener("keydown",keyboardDismiss,true);
		document.addEventListener("keypress",keyboardDismiss,true);
	}
}

function clearAutoDismissTimer() {
	if (autoDismissTimer) {
		clearTimeout(autoDismissTimer);
		autoDismissTimer = null;
	}
}

function keyboardDismiss(evt) {
	if (evt.key == "Escape") {
		dismiss(evt);
	}
}

function dismiss(evt) {
	if (
		!evt ||
		(
			bannerEl !== evt.target &&
			!bannerEl.contains(evt.target)
		)
	) {
		if (evt) {
			cancelEvent(evt);
		}
		hide();
	}
}

function hide() {
	clearAutoDismissTimer();

	if (!bannerEl.classList.contains("hidden")) {
		msgEl.innerText = "";
		msgEl.setAttribute("aria-live","off");
		btnEl.classList.remove("hidden");
		bannerEl.classList.add("hidden");
		mainEl.removeAttribute("inert");
		document.removeEventListener("click",dismiss,true);
		document.removeEventListener("keydown",keyboardDismiss,true);
		document.removeEventListener("keypress",keyboardDismiss,true);
		mainEl.removeEventListener("click",cancelEvent,true);
		mainEl.removeEventListener("keydown",cancelEvent,true);
	}
}

function onFormSubmit(evt) {
	cancelEvent(evt);
	hide();
}
