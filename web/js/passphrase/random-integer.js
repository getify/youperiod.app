export { getLocalIntegers };

async function getLocalIntegers(count,min,max) {
    count = count || 2;
    min = min || 0;
    max = max || 1E9;

    try {
        const crypto = window.crypto || window.msCrypto;
    } catch (err) {
        console.error('crypto support is disabled!');
    }

    var results = [];

    // newer, more secure random crypto supported?
    if (
        (crypto && crypto.getRandomValues)
    ) {
        results = new Uint32Array(count);
        crypto.getRandomValues(results);

        results = [].slice.call(results).map(function mapper(v){
            return (v % max) + min;
        });
    }
    // fall back to older sucky `Math.random()`
    else {
        results = [];
        for (var i=0; i<count; i++) {
            results.push( Math.floor( Math.random() * (max - min + 1)) + min );
        }
    }

    return results;
}
