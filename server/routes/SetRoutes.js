const express = require("express");
const router = express.Router();
const { validateKeys, validateRequired, validateValues } = require('../core/Validation');
const User = require('../models/UserModel');
const Set = require('../models/SetModel');

// В последствии, при появлении новых типов материалов, этот роутер придётся переоборудовать

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
        },
        setId: {}
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

router.get("/myall", async(req, res) => {
    const authToken = req.query.auth;
    // delete req.query.auth;
    const user = await User.authUser(authToken);
    if (user.hasOwnProperty('error')) {
        return res.status(403).send(user);
    }
    const sets = await Set.getUserSets(user);
    if (sets.hasOwnProperty('error')) {
        return res.status(500).send(sets.error);
    } else {
        return res.send(sets);
    }
});

router.get("/view", async(req, res) => {
    const authToken = req.query.auth;
    const user = await User.authUser(authToken);
    if (user.hasOwnProperty('error')) {
        return res.status(403).send(user.error);
    }

    /*
    Где-то здесь должна быть проверка доступа к сету
    Либо пользователь - автор
    Либо набор общедоступен
    Либо набор доступен по ссылке (и в запросе есть параметр указывающий на то, что доступ был по прямой ссылке)
    Либо пользователь перечислен в массиве доступных пользователей
    */

    const setId = req.query.id;
    const set = await Set.get(setId);
    if (set.hasOwnProperty('error')) {
        return res.status(500).send(set.error);
    } else {
        return res.send(set);
    }
});

router.get("/cards", async(req, res) => {
    const authToken = req.query.auth;
    const user = await User.authUser(authToken);
    if (user.hasOwnProperty('error')) {
        return res.status(403).send(user.error);
    }

    const setId = req.query.id;
    const cards = await Set.getCards(setId);
    if (cards.hasOwnProperty('error')) {
        return res.status(500).send(cards.error);
    } else {
        return res.send(cards);
    }
});

router.post('/saveStudy', async(req, res) => {
    const authToken = req.body.auth;
    const user = await User.authUser(authToken);
    if (user.hasOwnProperty('error')) {
        return res.status(403).send(user.error);
    }

    const setId = req.body.setId;
    const cards = req.body.cards;
    const save = await Set.saveStudy(user, setId, cards);
    if (save.hasOwnProperty('error')) {
        return res.status(500).send(save.error);
    } else {
        return res.send({ ok: 1 });
    }

});

router.delete("", async(req, res) => {
    const authToken = req.query.auth;
    const user = await User.authUser(authToken);
    if (user.hasOwnProperty('error')) {
        return res.status(403).send(user.error);
    }

    /*
    Где-то здесь должна быть проверка доступа к сету
    Либо пользователь - автор
    Либо набор общедоступен
    Либо набор доступен по ссылке (и в запросе есть параметр указывающий на то, что доступ был по прямой ссылке)
    Либо пользователь перечислен в массиве доступных пользователей
    */

    const setId = req.query.id;
    const result = await Set.deleteSet(setId);
    if (result.hasOwnProperty('error')) {
        return res.status(500).send(result.error);
    } else {
        return res.send({ ok: 1 });
    }
});


module.exports = router;