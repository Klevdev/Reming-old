const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.use("/sets", require('./Sets'));

router.get("/public", async(req, res) => {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        const materialsCollection = db.collection("materials");
        const materials = await materialsCollection.find({ isPublic: true }).toArray();

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
        const user = await users.findOne({ 'auth.token': authToken }, { projection: { _id: 1 } });
        const materialsCollection = db.collection("materials");
        const materials = await materialsCollection.find({ userId: user._id }).toArray();

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

        const materials = db.collection("materials");
        const materialId = new ObjectId(req.params.id);
        const material = await materials.findOne({ _id: materialId }, { projection: { _id: 0 } });

        if (!material) {
            return res.status(404).send({ error: 'Материал не найден' });
        }
        return res.send(material);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;