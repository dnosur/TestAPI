const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const joi = require("joi");
const { sendAnswer, validateObject } = require("../utils/utils");
const { getData, setData, updateData, deleteData, auth } = require("../db/db");

const path = "users/"

const hashSync = (user) => {
    user.login = bcrypt.hashSync(user.login, bcrypt.genSaltSync(10));
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
}

router.get("/", (req, res, next) => {
    //const promise = auth(req.body);
    const promise = getData(path);
    sendAnswer(promise, res, next);
});

router.post("/", (req, res, next) => {
    const scheme = joi.object({
        login: joi.string().required(),
        password: joi.string().required()
    });

    if (!validateObject(scheme, req.body)) {
        res.writeHead(400);
        return res.end(JSON.stringify({
            "error": "[POST ERROR]: Data is incorrect!",
            "message": "expected fields [login* password*]"
        }));
    }

    hashSync(req.body);

    const promise = setData(req.body, path);
    sendAnswer(promise, res, next, "User added completly!");
});

router.put("/:id", (req, res, next) => {
    const scheme = joi.object({
        login: joi.string().optional(),
        password: joi.string().optional()
    });

    if (!validateObject(scheme, req.body)) {
        res.writeHead(400);
        return res.end(JSON.stringify({
            "error": "[PUT ERROR]: Data is incorrect!",
            "message": "expected fields [login password]"
        }));
    }

    hashSync(req.body);

    const promise = updateData(req.body, path + req.params.id);
    sendAnswer(promise, res, next, "User update completly!");
});

router.delete("/:id", (req, res, next) => {
    const promise = deleteData(path + req.params.id);
    sendAnswer(promise, res, next);
})

module.exports = router;