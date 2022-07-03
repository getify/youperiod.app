computeViewportDimensions();
listenToScreenOrientationChanges();
window.addEventListener("resize",debounce(computeViewportDimensions,75,250),false);


// *********************************

// compute the vw/vh units more reliably than CSS does itself
function computeViewportDimensions() {
	if (document.documentElement && document.documentElement.style && document.documentElement.style.setProperty) {
		let docEl = document.documentElement;
		let width = Math.max(300,docEl.clientWidth);
		let height = Math.max(300,docEl.clientHeight);
		docEl.style.setProperty("--vw-unit",`${(width / 100).toFixed(1)}px`);
		docEl.style.setProperty("--vh-unit",`${(height / 100).toFixed(1)}px`);
	}
}

function listenToScreenOrientationChanges() {
	// work-arounds for browsers that don't fire "resize" when
	// the orientation changes
	// ref: https://developer.mozilla.org/en-US/docs/Web/API/
	//    ScreenOrientation/onchange
	if (
		typeof window.screen != "undefined" &&
		typeof window.screen.orientation != "undefined"
	) {
		window.screen.orientation.addEventListener("change",computeViewportDimensions,false);
	}
	// ref: https://www.reddit.com/r/javascript/comments/lttxdy/js_workaround_for_
	//    fixing_how_css_vwvh_units_arent/gp61ghe/
	// ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/matches
	else if (typeof window.matchMedia != "undefined") {
		let query = window.matchMedia("(orientation:landscape)");

		// handle variances in the event handling in various older browsers
		if (typeof query.addEventListener != "undefined") {
			query.addEventListener("change",computeViewportDimensions,false);
		}
		else if (typeof query.addListener != "undefined") {
			query.addListener(computeViewportDimensions);
		}
		else {
			query.onchange = computeViewportDimensions;
		}
	}
}

function debounce(fn,time,maxTime = 0) {
	time = Math.max(Number(time) || 0,0);
	maxTime = Math.max(Number(maxTime) || 0,0);
	if (maxTime > 0 && maxTime <= time) {
		maxTime = time + 1;
	}
	if (maxTime == 0) {
		maxTime = null;
	}

	var startTime;
	var timer;

	return function debounced(...args) {
		// need to init a debouncing cycle?
		if (startTime == null) {
			startTime = Date.now();
		}

		// (re)compute debounce window
		var now = Date.now();
		var timeToWait = (
			maxTime == null ? time : Math.min(time,maxTime - (now - startTime))
		);

		// current debounce window timer needs to
		// be cleared?
		if (timer != null) {
			clearTimeout(timer);
			timer = null;
		}

		// set debounce window timer
		timer = setTimeout(() => {
			fn(...args);

			// reset for the next event
			startTime = timer = null;
		},timeToWait);
	};
}
