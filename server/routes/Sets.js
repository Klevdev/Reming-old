const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.post("", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const users = db.collection("users");

        const user = await users.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Токен недействителен' });
        }
        const authValidThru = user.auth.validThru;
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const material = {
            type: "set",
            title: req.body.title,
            description: req.body.description,
            isPublic: req.body.isPublic,
            userId: user._id,
            timeCreated: Date.now()
        };

        const materials = db.collection("materials");
        let insert = await materials.insertOne(material);
        if (!insert) {
            return res.status(500).send({ error: 'Ошибка базы данных' });
        }

        const cards = db.collection("cards");
        insert = await cards.insertOne({ setId: material._id, cards: req.body.cards });
        if (!insert) {
            return res.status(500).send({ error: 'Ошибка базы данных' });
        }

        return res.send({ id: material._id });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});


router.put("/:id", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const users = db.collection("users");

        const user = await users.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Токен недействителен' });
        }
        const authValidThru = user.auth.validThru;
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const setId = new ObjectId(req.params.id);
        const set = {
            type: "set",
            title: req.body.title,
            description: req.body.description,
            isPublic: req.body.isPublic,
            userId: user._id,
            timeUpdated: Date.now()
        };

        const materials = db.collection("materials");
        let update = await materials.updateOne({ _id: setId }, {
            $set: set
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(500).send({ error: 'Ошибка базы данных 1' });
        }

        const cards = db.collection("cards");
        update = await cards.updateOne({ setId: setId }, {
            $set: { cards: req.body.cards }
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(500).send({ error: 'Ошибка базы данных 2' });
        }

        return res.send({ id: setId });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.delete("/:id", async(req, res) => {
    const authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

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

        const setId = new ObjectId(req.params.id);
        const cards = db.collection("cards");
        let deletion = await cards.deleteOne({ setId: setId });
        if (!deletion.deletedCount) {
            return res.status(500).send({ error: 'Ошибка удаления 1' });
        }
        const materials = db.collection("materials");
        deletion = await materials.deleteOne({ _id: setId });
        if (!deletion.deletedCount) {
            return res.status(500).send({ error: 'Ошибка удаления 2' });
        }

        return res.send({ ok: 1 });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.get("/:id", async(req, res) => {
    // Проверку авторизации следует делать только если набор не публичный
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const users = db.collection("users");

        const authValidThru = await users.findOne({ 'auth.token': authToken }).then(res => res.auth.validThru);
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const collection = db.collection("cards");
        const setId = new ObjectId(req.params.id);
        const cards = await collection.findOne({ setId: setId }, { projection: { _id: 0, setId: 0 } }).then(res => res.cards);

        return res.send(cards);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;