const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.post("", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("users");

        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const material = {
            type: "collection",
            title: req.body.title,
            description: req.body.description,
            isPublic: req.body.isPublic,
            userId: user._id,
            timeCreated: Date.now()
        };

        collection = db.collection("materials");
        let insert = await collection.insertOne(material);
        if (!insert) {
            return res.status(500).send({ error: 'Ошибка базы данных' });
        }
        let collMaterials = req.body.materials.map(id => new ObjectId(id));
        const collections = db.collection("collections");
        insert = await collections.insertOne({ materialId: material._id, materials: collMaterials });
        if (!insert) {
            return res.status(500).send({ error: 'Ошибка базы данных' });
        }

        // collection = db.collection("materials");
        // const materials = await collection.find({ _id: { $in: collMaterials } }).toArray();

        // return res.send(materials);
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
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("users");

        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const collectionId = new ObjectId(req.params.id);
        collection = db.collection("materials");
        let col = await collection.findOne({ _id: collectionId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (col.userId.toHexString() !== user._id.toHexString()) {
            return res.status(403).send({ error: "У вас нет доступа к этой коллекции" });
        }

        col = {
            type: "collection",
            title: req.body.title,
            description: req.body.description,
            isPublic: req.body.isPublic,
            timeUpdated: Date.now()
        };

        collection = db.collection("materials");
        let update = await collection.updateOne({ _id: collectionId }, {
            $set: col
        });
        if (!update.matchedCount || !update.modifiedCount) {
            return res.status(500).send({ error: 'Ошибка базы данных 1' });
        }

        let collMaterials = req.body.materials.map(id => new ObjectId(id));
        collection = db.collection("collections");
        update = await collection.updateOne({ materialId: collectionId }, {
            $set: { materials: collMaterials }
        });
        if (!update.matchedCount || !update.modifiedCount) {
            let insert = await collection.insertOne({ materialId: collectionId, materials: collMaterials });
            if (!insert) {
                return res.status(500).send({ error: 'Ошибка базы данных 2' });
            }
        }

        // collection = db.collection("materials");
        // const materials = await collection.find({ _id: { $in: collMaterials } }).toArray();

        // return res.send(materials);
        return res.send({ id: collectionId });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.patch("/:id/:materialId", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("users");

        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const collectionId = new ObjectId(req.params.id);
        collection = db.collection("materials");
        let col = await collection.findOne({ _id: collectionId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (col.userId.toHexString() !== user._id.toHexString()) {
            return res.status(403).send({ error: "У вас нет доступа к этой коллекции" });
        }

        collection = db.collection("collections");
        update = await collection.updateOne({ materialId: collectionId }, {
            $push: { materials: new ObjectId(req.params.materialId) }
        });
        if (!update.matchedCount || !update.modifiedCount) {
            let insert = await collection.insertOne({ materialId: collectionId, materials: collMaterials });
            if (!insert) {
                return res.status(500).send({ error: 'Ошибка базы данных 2' });
            }
        }

        // collection = db.collection("materials");
        // const materials = await collection.find({ _id: { $in: collMaterials } }).toArray();

        // return res.send(materials);
        return res.send({ ok: 1 });

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

        const collectionId = new ObjectId(req.params.id);


        collection = db.collection("materials");
        const set = await collection.findOne({ _id: collectionId }, { projection: { _id: 0, isPublic: 1, userId: 1 } });
        if (set.userId.toHexString() !== user._id.toHexString() && !user.isAdministrator) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        collection = db.collection("collections");
        await collection.deleteOne({ materialId: collectionId });

        collection = db.collection("materials");
        let deletion = await collection.deleteOne({ _id: collectionId });
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
    //     return res.status(401).send({ error: 'Отсутствует токен' });
    // }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("users");

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

        const collectionId = new ObjectId(req.params.id);

        collection = db.collection("materials");
        const material = await collection.findOne({ _id: collectionId }, { projection: { _id: 0, isPublic: 1, userId: 1, title: 1 } });
        if (!material) {
            return res.status(400).send({ error: "Материал не найден" });
        }
        if (!(material.userId.toHexString() === userId || material.isPublic)) {
            return res.status(403).send({ error: "У вас нет доступа к этому набору" });
        }

        collection = db.collection("collections");
        const collIdArray = await collection.findOne({ materialId: collectionId }, { projection: { _id: 0, materialId: 0 } }).then(res => res.materials);

        collection = db.collection("materials");
        const materials = await collection.find({ _id: { $in: collIdArray } }).toArray();

        return res.send({ title: material.title, materials: materials });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;