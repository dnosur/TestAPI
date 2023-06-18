const { initializeApp } = require("firebase/app");
const { set, onValue, update, remove, ref, getDatabase } = require("firebase/database");

const { generateId } = require("../utils/utils");

const jwt = require("jsonwebtoken");

const JWT_SECRET = "814789qjduq9wu0983urL:KEW)(!@JKW!S()!UYYioqjue891euy8ijhnq;el3[1p2o3-0";
const JWT_RESET_SECRET = "54q65w4d*-+*-*/8e234-1o20-oLE)W@OPL@)S_!@I_Kkqnewru129y378998192jfkm!&^#&*!";

const bcrypt = require("bcrypt");

const config = require("./firebase.config.json");
const firebase = initializeApp(config);

const tokenVerification = (req, res, next) => {
    if(!req.body.auth){
        res.writeHead(403);
        return res.end(JSON.stringify({
            error: "[AUTH ERROR] Bad authetification!",
            message: "Authetification was failed!"
        }));
    }

    const token = req.body.auth.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (error, user) => {
        if(error){
            res.writeHead(403);
            return res.end(JSON.stringify({
                error: "[AUTH ERROR] Bad request!",
                message: "Invalid token!"
            }))
        }
        
        req.user = user;
        next();
    })
}

const auth = (user) => {
    return new Promise((resolve, reject) => {
        onValue(ref(getDatabase(), "/users"), data => {
            const users = Object.values(JSON.parse(JSON.stringify(data)));

            const currentUser = users.filter(_user => bcrypt.compareSync(user.login, _user.login) && bcrypt.compareSync(user.password, _user.password))[0];

            if(currentUser){
                currentUser.token = jwt.sign({
                    login: currentUser.login,
                    password: currentUser.password
                }, JWT_SECRET, { expiresIn: "1h" });
                resolve(currentUser);
            }
            else{
                reject(JSON.stringify({
                    error: "[AUTH ERROR] Authetefication failed!",
                    message: "Wrong user data!"
                }))
            }
        })
    })
}

const getData = (path) => {
    return new Promise((resolve, reject) => {
        onValue(ref(getDatabase(), path), data => {
            if (Object.keys(data).length && data !== null) {
                resolve(data)
            }
            else {
                reject("Error while getting data");
            }
        })
    });
};

const setData = (data, path) => {
    data.id = generateId();
    return new Promise((resolve, reject) => {
        set(ref(getDatabase(), `${path}/${data.id}`), data).then(data => {
            if (data === undefined) {
                resolve(data)
            }
            else {
                reject("Error while adding data");
            }
        })
    })
};

const updateData = (data, path) => {
    return new Promise((resolve, reject) => {
        update(ref(getDatabase(), path), data).then(data => {
            if(data === undefined){
                resolve(data);
            }
            else reject("Error while updating data");
        })
    })
}

const deleteData = (path) => {
    return new Promise((resolve, reject) => {
        remove(ref(getDatabase(), path)).then(data => {
            if(data === undefined){
                resolve(data);
            }
            else reject("Error while deliting data");
        })
    })
}

module.exports = { getData, setData, updateData, deleteData, tokenVerification, auth };