const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.use("/sets", require('./Sets'));
router.use("/collections", require('./Collections'));

router.get("/public", async(req, res) => {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        const collection = db.collection("materials");
        const materials = await collection.find({ isPublic: true }).toArray();

        return res.send(materials);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});


router.get("/personal", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined || authToken === null) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        let collection = db.collection("users");
        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, name: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }
        collection = db.collection("materials");
        const materials = await collection.find({ userId: user._id }).toArray();
        return res.send(materials);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.get("/:id", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    // if (authToken === '' || authToken === undefined || authToken === null) {
    //     return res.status(400).send({ error: 'Отсутствует токен' });
    // }
    if (req.params.id === undefined) {
        return res.status(400).send({ error: 'Id не передан' });
    }
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

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

        const materialId = new ObjectId(req.params.id);

        collection = db.collection("materials");
        const material = await collection.findOne({ _id: materialId });
        if (!material) {
            return res.status(404).send({ error: 'Материал не найден' });
        }
        if (!(material.userId.toHexString() === userId || material.isPublic)) {
            return res.status(403).send({ error: "У вас нет доступа к этому материалу" });
        }
        collection = db.collection("users");
        user = await collection.findOne({ _id: material.userId }, { projection: { _id: 0, name: 1 } });
        material.author = user.name;
        delete material.userId;

        return res.send(material);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;