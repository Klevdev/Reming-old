const express = require("express");
const router = express.Router();
const { validateKeys, validateRequired, validateValues } = require('../core/Validation');
const User = require('../models/UserModel');
const Set = require('../models/SetModel');

router.post('/new', async(req, res) => {
    const authToken = req.body.auth;
    delete req.body.auth;
    const user = await User.authUser(authToken);
    if (user.hasOwnProperty('error')) {
        return res.status(403).send(user.error);
    }

    const set = req.body;

    const rules = {
        title: {
            required: true,
            lengthRange: [3, 50]
        },
        description: {
            lengthRange: [0, 100]
        },
        isPublic: {},
        cards: {
            required: true
        }
    };

    let check = validateKeys(set, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    check = validateRequired(set, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    check = validateValues(set, rules);
    if (!check.hasOwnProperty('ok')) {
        return res.status(400).send(check);
    }

    let result = await Set.addNew(set, user);
    if (result.hasOwnProperty('error')) {
        return res.status(409).send(result);
    } else {
        return res.send(result);
    }

});

module.exports = router;