module.exports = { addNew, getUserSets, get, getCards, saveStudy, deleteSet };

const { MongoClient, ObjectID } = require('mongodb');

const mongoClient = new MongoClient('mongodb://localhost:27017/reming');

async function addNew(request, user) {
    const set = {
        title: request.title,
        description: request.description,
        userId: user._id,
        isPublic: request.isPublic,
        creationDate: new Date().toString()
    };
    let setId;
    if (request.setId) {
        setId = new ObjectID(request.setId);
    } else {
        set.creationDate = new Date().toString()
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("sets");
        let insert;
        if (!setId) {
            insert = await collection.insertOne(set)
                .catch(err => console.error(err));
            // insertOne автоматически добавляет в добавляемый объект поле _id
            setId = set._id;
        } else {
            insert = await collection.updateOne({
                    _id: setId
                }, set)
                .catch(err => console.error(err));

        }
        if (insert) {
            collection = db.collection("flashCards");

            let cards = request.cards;
            if (request.setId) {
                // если запрос пришёл на редактирование
                cards.forEach(async card => {
                    let update = await collection.updateOne({
                            _id: card._id
                        }, card)
                        .catch(err => console.error(err));
                    if (update) {
                        return { setId: setId };
                    } else {
                        return { error: "Ошибка записи в БД" };
                    }
                });
            } else {
                cards.forEach(card => {
                    card.setId = setId;
                });
                insert = await collection.insertMany(cards)
                    .catch(err => console.error(err));
                if (insert) {
                    return { setId: setId };
                } else {
                    return { error: "Ошибка записи в БД" };
                }
            }
        } else {
            return { error: "Ошибка записи в БД" };
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}


async function getUserSets(user) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("sets");
        const query = {
            userId: user._id
        };
        const project = {
            userId: 0
        };
        let sets = await collection
            .find(query)
            .project(project)
            .toArray()
            .catch(err => console.error(err));
        return sets;
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}

async function get(id) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("sets");
        let query = {
            _id: new ObjectID(id)
        };
        let project = {
            _id: 0
        };
        let set = await collection
            .find(query)
            .project(project)
            .toArray()
            .then(res => res[0])
            .catch(err => console.error(err));
        if (set) {
            collection = db.collection("users");
            query = {
                _id: set.userId
            };
            project = {
                _id: 0,
                name: 1
            };
            let author = await collection
                .find(query)
                .project(project)
                .toArray()
                .then(res => res[0])
                .catch(err => console.error(err));

            delete set.userId;
            set.author = author.name;
            return set;
        } else {
            return { error: 'ошиибка при считывании из бд' };
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}

async function getCards(setId) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("flashCards");
        let query = {
            setId: new ObjectID(setId)
        };
        let project = {
            setId: 0
        };
        let cards = await collection
            .find(query)
            .project(project)
            .toArray()
            .catch(err => console.error(err));
        if (cards) {
            return cards;
        } else {
            return { error: 'ошиибка при считывании из бд' };
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}

async function saveStudy(user, setId, cards) {
    const study = {
        userId: user._id,
        setId: setId,
        cards: cards,
        studyDate: new Date().toString()
    };
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("userStats");

        let insert = await collection.insertOne(study)
            .catch(err => console.error(err));
        // insertOne автоматически добавляет в добавляемый объект поле _id
        if (insert) {
            return { ok: 1 };
        } else {
            return { error: "Ошибка записи в БД" };
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}

async function deleteSet(setId) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("sets");
        let query = {
            _id: new ObjectID(setId)
        };
        let deletion = await collection
            .deleteOne(query)
            .catch(err => console.error(err));
        if (deletion) {
            console.log(2, deletion);
            collection = db.collection("flashCards");
            let query = {
                setId: new ObjectID(setId)
            };
            deletion = await collection
                .deleteMany(query)
                .catch(err => console.error(err));
            if (deletion) {
                return { ok: 1 };
            } else {
                return { error: 'Ошибка удаления из бд' };
            }
        } else {
            return { error: 'Ошибка удаления из бд' };
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}