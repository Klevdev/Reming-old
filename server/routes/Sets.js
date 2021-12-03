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

router.get("/cards/:id", async(req, res) => {

});

router.put("/:id", async(req, res) => {

});

router.delete("/:id", async(req, res) => {

});

module.exports = router;