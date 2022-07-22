import * as RandomPhrase from './passphrase/random-phrase.js';

export async function generate(wordLength = 6, language = 'en') {
    return RandomPhrase.get(wordLength, language);
}
