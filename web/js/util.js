function cancelEvent(evt) {
	evt.preventDefault();
	evt.stopImmediatePropagation();
	evt.stopPropagation();
}

function delay(ms) {
	return new Promise(r => setTimeout(r,ms));
}

function parseArgon2(key) {
	var parts = key.split("$");
	return {
		algorithm: parts[1],
		version: parseArgs(parts[2]).v,
		params: parseArgs(parts[3]),
		salt: parts[4],
		hash: parts[5],
	};

	// *************************

	function parseArgs(args) {
		var ret = {};
		for (let arg of args.split(",")) {
			let [ ,argName, argVal ] = arg.match(/^([^=]*?)=(.*?)$/);
			if (!Number.isNaN(Number(argVal))) {
				argVal = Number(argVal);
			}
			ret[argName] = argVal;
		}
		return ret;
	}
}
