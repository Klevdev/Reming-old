const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.post("", async(req, res) => {
    const authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const users = db.collection("users");
        const user = await users.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Отсутствует токен' });
        }
        const authValidThru = user.auth.validThru;
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }
        const study = {
            userId: user._id,
            materialType: req.body.materialType,
            materialId: new ObjectId(req.body.materialId),
            time: Date.now(),
            correctCount: req.body.correctCount,
            incorrectCount: req.body.incorrectCount,
            items: req.body.items
        };

        const collection = db.collection("studies");
        const insert = await collection.insertOne(study);

        if (!insert) {
            return res.status(500).send({ error: 'Ошибка базы данных' });
        }

        return res.send({ ok: 1 });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.get("", async(req, res) => {
    const authToken = req.headers['x-access-token'];
    if (authToken === '' || authToken === undefined) {
        return res.status(400).send({ error: 'Отсутствует токен' });
    }
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("users");
        const user = await collection.findOne({ 'auth.token': authToken }, { projection: { auth: 1 } });
        if (!user) {
            return res.status(400).send({ error: 'Отсутствует токен' });
        }
        const authValidThru = user.auth.validThru;
        if (authValidThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        collection = db.collection("studies");
        const studies = await collection.find({ userId: user._id }, { projection: { _id: 0, userId: 0, materialType: 0 } }).toArray();
        const studiesIds = studies.map(item => item.materialId);

        collection = db.collection("materials");
        const materials = await collection.find({ _id: { $in: studiesIds } }, { projection: { _id: 1, title: 1, type: 1 } }).toArray();

        // studies.forEach(study => {
        //     study.material = materials.find(material => material._id.toHexString() === study.materialId.toHexString());
        //     delete study.materialId
        // });

        materials.forEach(material => {
            material.studies = studies.filter(study => study.materialId.toHexString() === material._id.toHexString())
        });
        materials.forEach(material => {
            material.studies.forEach(study => {
                delete study.materialId;

            })
        });

        return res.send(materials);

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;