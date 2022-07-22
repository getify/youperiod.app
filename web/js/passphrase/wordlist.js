export { get };

async function get(languageCode) {
	return local(`/diceware/wordlist.${languageCode}.json`);
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
