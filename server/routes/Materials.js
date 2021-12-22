const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.DB_URL);

router.use("/sets", require('./Sets'));
router.use("/collections", require('./Collections'));

router.get("/:id", async(req, res) => {
    let authToken = req.headers['x-access-token'];
    // if (authToken === '' || authToken === undefined || authToken === null) {
    //     return res.status(400).send({ error: 'Отсутствует токен' });
    // }
    if (req.params.id === undefined) {
        return res.status(401).send({ error: 'Id не передан' });
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

router.get("", async(req, res) => {
    // console.log(req.query);
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        let query = {};
        if (req.query.private) {
            let authToken = req.headers['x-access-token'];
            if (authToken === '' || authToken === undefined || authToken === null) {
                return res.status(401).send({ error: 'Отсутствует токен' });
            }
            let collection = db.collection("users");
            let user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, name: 1 } });
            if (!user) {
                return res.status(401).send({ error: 'Токен недействителен' });
            }
            if (user.auth.validThru < Date.now()) {
                return res.status(401).send({ error: "Время сеанса истекло" });
            }
            query.userId = user._id;
            // Поиск по _id - несовсем ясно надо ли оно
            // if (req.query.ids) {
            //     let ids = req.query.ids.split(' ').map(id => new ObjectId(id))
            //     query._id = { $in: ids };
            // }
        } else {
            query.isPublic = true;
        }


        // TODO: Поиск по именам пользователей
        if (req.query.q) {
            const qFields = req.query.qFields ? req.query.qFields.split(' ') : ['title', 'description'];
            query.$or = [];
            qFields.forEach(field => {
                if (['title', 'description'].indexOf(field) === -1) {
                    return res.status(400).send({ error: "Неверно указано поле поиска" })
                }
                query.$or.push({
                    [field]: new RegExp(req.query.q, 'i')
                });
            });
        }
        if (req.query.type) {
            let types = req.query.type.split(' ');
            types.forEach(type => {
                if (['set', 'collection'].indexOf(type) === -1) {
                    return res.status(400).send({ error: "Неверно указан тип материала" })
                }
            });
            query.type = { $in: types };
        }

        const materialsPerPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
        const currentPage = req.query.page ? parseInt(req.query.page) : 1;
        if (isNaN(materialsPerPage) || isNaN(currentPage)) {
            return res.status(400).send({ error: "Неверно указана пагинация" })
        }

        let sort;
        if (req.query.sort && ['tc', 'rt'].indexOf(req.query.sort)) {
            sort = { 'tc': 'timeCreated', 'rt': 'rating' }[req.query.sort];
        } else {
            sort = 'timeCreated';
        }
        const desc = !!req.query.desc ? -1 : 1;

        const collection = db.collection("materials");
        const pagesCount = await collection.countDocuments().then(res => Math.ceil(res / materialsPerPage));
        const materials = await collection.find(query)
            .sort({
                [sort]: desc
            })
            .skip(currentPage > 0 ? ((currentPage - 1) * materialsPerPage) : 0)
            .limit(materialsPerPage)
            .toArray();

        return res.send({ pagesCount: pagesCount, materials: materials });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

router.patch("/ratings/:id", async(req, res) => {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");

        let authToken = req.headers['x-access-token'];
        if (authToken === '' || authToken === undefined || authToken === null) {
            return res.status(401).send({ error: 'Отсутствует токен' });
        }
        let collection = db.collection("users");
        let user = await collection.findOne({ 'auth.token': authToken }, { projection: { _id: 1, auth: 1, name: 1 } });
        if (!user) {
            return res.status(401).send({ error: 'Токен недействителен' });
        }
        if (user.auth.validThru < Date.now()) {
            return res.status(401).send({ error: "Время сеанса истекло" });
        }

        const materialId = new ObjectId(req.params.id);
        collection = db.collection("materials");
        const material = await collection.findOne({ _id: materialId }, { projection: { _id: 0, userId: 1, ratings: 1, ratingAvg: 1 } });

        if (material.userId.toHexString() === user._id.toHexString()) {
            return res.status(403).send({ error: "Вы не можете оценивать свой материал" });
        }

        if (!req.body.rating) {
            return res.status(400).send({ error: "Не указана оценка" });
        }

        const newRating = {
            userId: user._id,
            rating: req.body.rating
        };

        let userAlreadyRated = false;
        let ratingAvg;
        if (material.ratingAvg) {
            let sum = newRating.rating;
            let count = 1;
            material.ratings.forEach(rating => {
                if (rating.userId.toHexString() === user._id.toHexString()) {
                    userAlreadyRated = true;
                } else {
                    count++;
                    sum += rating.rating;
                }
            });
            ratingAvg = sum / count;
        } else {
            ratingAvg = newRating.rating;
        }

        let update;
        if (userAlreadyRated) {
            update = await collection.updateOne({ _id: materialId, "ratings.userId": user._id }, {
                $set: {
                    ratingAvg: ratingAvg,
                    "ratings.$.rating": newRating.rating
                }
            });
        } else {
            update = await collection.updateOne({ _id: materialId }, {
                $set: { ratingAvg: ratingAvg },
                $push: {
                    ratings: newRating
                }
            });
        }

        // if (!update.matchedCount || !update.modifiedCount) {
        //     return res.status(500).send({ error: 'Ошибка базы данных' });
        // } else {
        return res.send({ ratingAvg: ratingAvg });
        // }

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err });
    } finally {
        await mongoClient.close();
    }
});

module.exports = router;