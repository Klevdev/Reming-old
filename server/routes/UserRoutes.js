const express = require("express");
const router = express.Router();
const { validateKeys, validateRequired, validateValues } = require('../core/Validation')
const User = require('../models/UserModel');

router.post('/login', async(req, res) => {
    // console.log(req.body);
    const rules = {
        login: {
            required: true,
            lengthRange: [3, 30]
        },
        password: {
            required: true,
            lengthRange: [1, 30]
        }
    };

    var check = validateKeys(req.body, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    check = validateRequired(req.body, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    check = validateValues(req.body, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    let result = await User.login(req.body);

    if (result.hasOwnProperty('error')) {
        return res.status(409).send(result);
    } else {
        // console.log(result);
        // res.cookie('auth', result.authToken, { maxAge: 900000, httpOnly: true });
        return res.send(result);
    }
});


router.post('/logout', async(req, res) => {
    let authToken = req.body.auth;
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'No token provided' });
    }

    let result = User.logout(authToken);
    return res.send(result);
});


router.post('/signup', async(req, res) => {
    // console.log(req.body);
    const rules = {
        login: {
            required: true,
            lengthRange: [4, 30],
            restrictedChars: '!#$^*(){};:|/'
        },
        name: {
            required: true,
            lengthRange: [3, 30],
            restrictedChars: '!#$^*(){};:|/'
        },
        email: {
            required: true,
            email: true,
            lengthRange: [5, 30]
        },
        password: {
            required: true,
            lengthRange: [8, 30],
        }
    };

    var check = validateKeys(req.body, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    check = validateRequired(req.body, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    check = validateValues(req.body, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    let result = await User.signup(req.body);

    if (result.hasOwnProperty('error')) {
        return res.status(409).send(result);
    } else {
        // console.log(result);
        // res.cookie('auth', result.authToken, { maxAge: 900000, httpOnly: true });
        return res.send(result);
    }
});

module.exports = router;