export { get };

async function get(languageCode) {
	try {
		return local(`/diceware/wordlist.${languageCode}.json`);
	} catch (err) {
		// Fallback to english if language file doesn't exist
		return local(`/diceware/wordlist.en.json`);
	}
}

function local(filepath) {
	return fetch(filepath)
		.then(function (response) {
			if (!response.ok) {
				throw new Error("HTTP error " + response.status);
			}

			return response.json();
		})
		.catch(function (error) {
			console.error(error)
		})
}
