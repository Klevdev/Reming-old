const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.post("", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(401).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const users = db.collection("users");

        const user = await users.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(401).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
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
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(401).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("users");

        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(401).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const setId = new ObjectId(req.params.id);
        collection = db.collection("materials");
        let set = await collection.findOne({ _id: setId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (set.userId.toHexString() !== user._id.toHexString()) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        set = {
            type: "set",
            title: req.body.title,
            description: req.body.description,
            isPublic: req.body.isPublic,
            timeUpdated: Date.now()
        };

        collection = db.collection("materials");
        let update = await collection.updateOne({ _id: setId }, {
            $set: set
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(500).send({ error: 'Ошибка базы данных 1' });
        }

        collection = db.collection("cards");
        update = await collection.updateOne({ setId: setId }, {
            $set: { cards: req.body.cards }
        });
        if (!update.matchedCount || !update.modifiedCount) {
            insert = await collection.insertOne({ setId: setId, cards: req.body.cards });
            if (!insert) {
                return res.status(500).send({ error: 'Ошибка базы данных 2' });
            }
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
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(401).send({ error: 'Отсутствует токен' });
    }
    try {
        await mongoClient.connect();
        const db = mongoClient.db('reming');
        let collection = db.collection("users");

        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, isAdministrator: 1 } });

        if (!user) {
            return res.status(401).send({ error: 'Отсутствует токен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const setId = new ObjectId(req.params.id);


        collection = db.collection("materials");
        const set = await collection.findOne({ _id: setId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (set.userId.toHexString() !== user._id.toHexString() && !user.isAdministrator) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        collection = db.collection("studies");
        await collection.deleteMany({ materialId: setId });

        collection = db.collection("cards");
        await collection.deleteOne({ setId: setId });

        collection = db.collection("materials");
        let deletion = await collection.deleteOne({ _id: setId });
        if (!deletion.deletedCount) {
            return res.status(500).send({ error: 'Ошибка удаления 3' });
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
    // if (authToken === '' || authToken === undefined || authToken === null) {
    //     return res.status(400).send({ error: 'Отсутствует токен' });
    // }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        collection = db.collection("users");

        let userId;
        if (authToken !== '' && authToken !== undefined && authToken !== null) {
            collection = db.collection("users");
            let user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, name: 1 } });
            if (!user) {
                return res.status(401).send({ error: "Токен недействителен" });
            }
            if (user.auth.validThru < Date.now()) {
                return res.status(401).send({ error: "Время сеанса истекло" });
            }
            userId = user._id.toHexString();
        } else {
            userId = '';
        }

        const setId = new ObjectId(req.params.id);

        collection = db.collection("materials");
        const material = await collection.findOne({ _id: setId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (!material) {
            return res.status(401).send({ error: "Материал не найден" });
        }
        if (!(material.userId.toHexString() === userId || material.isPublic)) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        collection = db.collection("cards");
        const cards = await collection.findOne({ setId: setId }, { projection: { _id: 0, setId: 0 } });

        if (!cards) {
            return res.status(200).send({ error: "В наборе нет карточек" });
        }
        return res.send(cards.cards);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.get("/repetitions/:id", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(401).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        collection = db.collection("users");
        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, name: 1 } });
        if (!user) {
            return res.status(401).send({ error: "Токен недействителен" });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const setId = new ObjectId(req.params.id);

        collection = db.collection("materials");
        const set = await collection.findOne({ _id: setId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (!(set.userId.toHexString() === user._id.toHexString() || set.isPublic)) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        collection = db.collection("cards");
        const cards = await collection.findOne({ setId: setId }, { projection: { _id: 0, setId: 0 } });

        if (!cards) {
            return res.status(200).send({ error: "В наборе нет карточек" });
        }

        collection = db.collection("repetitons");
        let repetitions = await collection.findOne({ setId: setId }, { projection: { _id: 0, setId: 0 } });

        if (!repetitions) {
            repetitions = await collection.insertOne({
                userId: user._id,
                setId: setId,
                curr: cards.cards.map(card => card.idx),
                next: []
            });
        }
        return res.send(cards.cards.filter(card => repetitions.includes(card.idx)));

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.put("/repetitions/:id", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(401).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        collection = db.collection("users");
        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, name: 1 } });
        if (!user) {
            return res.status(401).send({ error: "Токен недействителен" });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const setId = new ObjectId(req.params.id);

        collection = db.collection("materials");
        const set = await collection.findOne({ _id: setId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (!(set.userId.toHexString() === user._id.toHexString() || set.isPublic)) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        collection = db.collection("cards");
        const cards = await collection.findOne({ setId: setId }, { projection: { _id: 0, setId: 0 } });

        if (!cards) {
            return res.status(200).send({ error: "В наборе нет карточек" });
        }

        collection = db.collection("repetitons");
        let repetitions = await collection.findOne({ setId: setId }, { projection: { _id: 0, setId: 0 } });

        if (!repetitions) {
            return res.status(400).send({ error: "Для данного набора нет записей о повторениях" });
        }

        let repNextOld = repetitions.next;
        let repCurrNew = repNextOld.map(idx => !repCurrNew.includes(idx)).concat(repCurrNew);

        const update = await collection.updateOne({
            userId: user._id,
            setId: setId
        }, {
            curr: repCurrNew,
            next: req.body.correct
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(500).send({ error: 'Ошибка БД' });
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