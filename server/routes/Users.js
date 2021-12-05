const express = require("express");
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();
const { hash, random } = require("../core/cryptoFunctions");

const mongoClient = new MongoClient(process.env.DB_URL);

router.get('', async(req, res) => {
    res.send({ error: "NOT AVAILABLE" });
});

router.get('/:id', async(req, res) => {
    res.send({ error: "NOT AVAILABLE" });
});

router.post('/signup', async(req, res) => {
    // Проверку занятости логина осуществить на клиенте, но и здесь тоже нужно
    const user = {
        email: req.body.email,
        name: req.body.name,
        password: hash(req.body.password),
        timeCreated: Date.now()
    };

    try {
        await mongoClient.connect();
        const db = mongoClient.db('reming');
        const users = db.collection("users");

        await users.insertOne(user)

        let tokenRaw;
        let authToken;
        do {
            tokenRaw = random();
            authToken = hash(tokenRaw, 'hex');
        } while (!users.find({ "auth.token": authToken }));

        const timeStamp = Date.now() + 1000 * 60 * 60 * 12;

        await users.updateOne({ _id: user._id }, {
            $set: {
                auth: {
                    token: authToken,
                    validThru: timeStamp
                }
            }
        });

        return res.status(200).send({ name: user.name, auth: authToken });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.post('/login', async(req, res) => {
    const query = {
        email: req.body.email,
        password: hash(req.body.password)
    };

    try {
        await mongoClient.connect();
        const db = mongoClient.db('reming');
        const users = db.collection("users");

        const find = await users.findOne(query, { projection: { _id: 0, name: 1 } });
        if (!find) {
            return res.status(401).send({ error: "Неправильный логин или пароль" });
        }
        let tokenRaw;
        let authToken;
        do {
            tokenRaw = random();
            authToken = hash(tokenRaw, 'hex');
        } while (!users.find({ "auth.token": authToken }));

        const timeStamp = Date.now() + 1000 * 60 * 60 * 12;

        const update = await users.updateOne(query, {
            $set: {
                auth: {
                    token: authToken,
                    validThru: timeStamp
                }
            }
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(500).send({ error: 'Произошла ошибка сервера' });
        } else {
            return res.status(200).send({ name: find.name, auth: authToken });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }

});


router.post('/logout', async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db('reming');
        const users = db.collection("users");

        await users.updateOne({ 'auth.token': authToken }, {
            $unset: {
                auth: 1
            }
        });
        return res.send({ ok: 1 });
        // if (!update.matchedCount || !update.modifiedCount) {
        //     return res.status(401).send({ error: 'Пользователь не найден' });
        // } else {
        // }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }

});

router.put('', async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db('reming');
        const users = db.collection("users");

        const password = hash(req.body.password);
        const check = await users.findOne({ 'auth.token': authToken, password: password });
        if (!check) {
            return res.status(401).send({ error: "Неправильный пароль или токен" });
        }
        const authValidThru = await users.findOne({ 'auth.token': authToken }).then(res => res.auth.validThru);
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const query = {
            email: req.body.email,
            name: req.body.name,
            password: hash(req.body.password)
        };

        const update = await users.updateOne({ 'auth.token': authToken }, {
            $set: query
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(401).send({ error: 'Пользователь не найден' });
        } else {
            return res.send({ ok: 1 });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }

});

router.delete('', async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    const password = hash(req.body.password);


    try {
        await mongoClient.connect();
        const db = mongoClient.db('reming');
        const users = db.collection("users");

        const user = await users.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Отсутствует токен' });
        }
        const authValidThru = user.auth.validThru;
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }
        const check = await users.findOne({ 'auth.token': authToken, password: password }, { projection: { _id: 0 } });
        if (!check) {
            return res.status(401).send({ error: "Неправильный пароль" });
        }

        const deletion = await users.deleteOne({ 'auth.token': authToken });
        // Здесь также нужно удалять или изменять всё, что связано с пользователем
        if (!deletion.deletedCount) {
            return res.status(401).send({ error: 'Пользователь не найден' });
        } else {
            return res.send({ ok: 1 });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;