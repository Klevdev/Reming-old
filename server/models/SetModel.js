module.exports = { addNew };

const { MongoClient } = require('mongodb');

const mongoClient = new MongoClient('mongodb://localhost:27017/reming');

async function addNew(request, user) {
    const set = {
        title: request.title,
        description: request.description,
        userId: user._id,
        creationDate: new Date().toString()
    };
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        let collection = db.collection("sets");

        let insert = await collection.insertOne(set)
            .catch(err => console.error(err));
        // insertOne автоматически добавляет в добавляемый объект поле _id
        const setId = set._id;
        if (insert) {
            collection = db.collection("flashCards");
            let cards = request.cards;
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
        } else {
            return { error: "Ошибка записи в БД" };
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoClient.close();
    }
}