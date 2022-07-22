import { wordlist } from './wordlist.js';
import * as RandomIntegers from './random-integer.js';

export { get };


function segmentArray(arr,segmentSize) {
	return Array.apply(null,{length:Math.ceil(arr.length / segmentSize)}).map(function mapper(_,i){
		return arr.slice(i*segmentSize,(i+1)*segmentSize);
	});
}

function makePhrase(nums,wordlist) {
	return segmentArray(nums,5).map(function mapper(num){
			return wordlist[num.join("")];
		})
		.join(" ");
}

async function get(wordCount) {
	return makePhrase(
		await RandomIntegers.getLocalIntegers(wordCount * 5,1,6),
		await wordlist
	);
}
