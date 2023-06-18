const generateId = () => {
    return Array.from(
        {length: 8},
        () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890#@"[Math.floor(Math.random() * 64)]
    ).join("");
};

const validateObject = (scheme, obj) => {
    return !scheme.validate(obj).error;
}

const sendAnswer = (promise, res, next, success = null) => {
    return promise.then(data => {
        if(success) res.end(JSON.stringify(success));
        else res.end(JSON.stringify(data));
        next();
    }).catch(err => {
        res.end(JSON.stringify(err));
        next();
    })
}

module.exports = { generateId, validateObject, sendAnswer }