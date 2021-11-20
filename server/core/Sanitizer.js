function castToStrings(object) {
    for (let key in object) {
        if (object[key] === null) {
            object[key] = '';
        }
        try {
            object[key].toString();
        } catch (err) {
            console.error(err);
            object[key] = '';
        }
    }
    return object;
}

module.exports = { castToStrings }