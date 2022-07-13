export { init, show, hide, };

const AUTO_DISMISS_DELAY = 5000;
var bodyEl;
var mainEl;
var headerEl;
var footerEl;
var bannerEl;
var formEl;
var msgEl;
var cancelBtnEl;
var okBtnEl;
var autoDismissTimer;
var closeCallback;


// ****************************

function init(mainDOMElement) {
	bodyEl = mainDOMElement;
	mainEl = bodyEl.querySelector("main");
	headerEl = bodyEl.querySelector("header");
	footerEl = bodyEl.querySelector("footer");
	bannerEl = document.getElementById("notification-banner");
	formEl = bannerEl.querySelector("form");
	msgEl = bannerEl.querySelector(".msg");
	cancelBtnEl = bannerEl.querySelector("button.cancel-btn");
	okBtnEl = bannerEl.querySelector("button[type=submit]");

	formEl.addEventListener("submit",onFormSubmit,false);
	cancelBtnEl.addEventListener("click",() => hide(/*result=*/false),false);
}

function show(msg,isModal = false,isError = false,showCancel = false,onClose = () => {}) {
	closeCallback = onClose;

	// banner already shown?
	if (!bannerEl.classList.contains("hidden")) {
		hide(/*result=*/false);
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
		okBtnEl.classList.remove("hidden");
		okBtnEl.focus();
		mainEl.setAttribute("inert","inert");
		headerEl.setAttribute("inert","inert");
		footerEl.setAttribute("inert","inert");
		mainEl.addEventListener("click",cancelEvent,true);
	}
	else {
		okBtnEl.classList.add("hidden");
		if (autoDismissTimer) {
			clearTimeout(autoDismissTimer);
		}
		autoDismissTimer = setTimeout(() => hide(/*result=*/false),AUTO_DISMISS_DELAY);
		document.addEventListener("click",dismiss,true);
	}

	if (!isModal || showCancel) {
		document.addEventListener("keydown",keyboardDismiss,true);
		document.addEventListener("keypress",keyboardDismiss,true);
	}
	else {
		mainEl.addEventListener("keydown",cancelEvent,true);
	}

	// show the 'cancel' button?
	if (showCancel) {
		cancelBtnEl.classList.remove("hidden");
		cancelBtnEl.focus();
	}
	else {
		cancelBtnEl.classList.add("hidden");
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
		cancelEvent(evt);
		hide(/*result=*/false);
	}
}

function dismiss(evt) {
	// click event OUTSIDE of banner?
	if (!(
		bannerEl === evt.target ||
		bannerEl.contains(evt.target)
	)) {
		if (evt) {
			cancelEvent(evt);
		}
		hide(/*result=*/false);
	}
}

function hide(result = false) {
	clearAutoDismissTimer();

	if (!bannerEl.classList.contains("hidden")) {
		msgEl.innerText = "";
		msgEl.setAttribute("aria-live","off");
		okBtnEl.classList.remove("hidden");
		cancelBtnEl.classList.add("hidden");
		bannerEl.classList.add("hidden");
		mainEl.removeAttribute("inert");
		headerEl.removeAttribute("inert");
		footerEl.removeAttribute("inert");
		document.removeEventListener("click",dismiss,true);
		document.removeEventListener("keydown",keyboardDismiss,true);
		document.removeEventListener("keypress",keyboardDismiss,true);
		mainEl.removeEventListener("click",cancelEvent,true);
		mainEl.removeEventListener("keydown",cancelEvent,true);

		Promise.resolve(result).then(closeCallback);
		closeCallback = null;
	}
}

function onFormSubmit(evt) {
	cancelEvent(evt);
	hide(/*result=*/true);
}
