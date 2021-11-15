function castToStrings(object) {
    for (let key in object) {
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