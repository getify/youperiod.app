export { getLocalIntegers };

async function getLocalIntegers(count = 2,min = 0,max = 1E9) {
    try {
        const crypto = window.crypto || window.msCrypto;
    } catch (err) {
        console.error('crypto support is disabled!');
    }

    var results = [];

    results = new Uint32Array(count);
    crypto.getRandomValues(results);

    results = [].slice.call(results).map(function mapper(v){
        return (v % max) + min;
    });

    return results;
}
