// module.exports = { authUser, findOne, login, logout, signup };

const { MongoClient } = require('mongodb');
const crypto = require('crypto');


const mongoClient = new MongoClient(process.env.DB_URL);

async function findOne(query, project = null) {
    if (project === null) {
        project = { _id: 1 };
    }
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const collection = db.collection("users");
        let result = await collection
            .find(query)
            .project(project)
            .toArray()
            .then(res => res[0])

        return result;
    } catch (err) {
        // console.log("Возникла ошибка");
        console.error(err);
    } finally {
        await mongoClient.close();
        // console.log("Подключение закрыто");
    }
}

/*
Здесь по-хорошему нужно проверять имеет ли пользователь
1. Доступ к разделу вообще (есть токен или нет)
2. Доступ к запрашиваемому ресурсу
В разных случаях надо возвращать либо 401, либо 403
*/
async function authUser(token) {
    if (token === undefined || !token) {
        return { error: "Отсутсвует токен" };
    }
    const user = await findOne({ authToken: token });
    if (user) {
        return user;
    } else {
        return { error: "Пользователь не авторизован" }
    }
}

async function login(request) {
    const md5sum = crypto.createHash('md5');
    const passwordHashed = md5sum.update(request.password).digest('hex');
    const query = {
        login: request.login,
        password: passwordHashed
    };
    const project = { _id: 1, name: 1 };
    const user = await findOne(query, project)
        .catch(err => console.error(err));
    if (user) {
        const authToken = await generateAuthToken(user._id);
        return { name: user.name, auth: authToken };
    } else {
        return { error: "Неправильный логин или пароль" };
    }
}

async function signup(request) {
    // console.log(request.password);
    const md5sum = crypto.createHash('md5');
    const passwordHashed = md5sum.update(request.password).digest('hex');
    // console.log(passwordHashed);
    const user = {
        login: request.login,
        name: request.name,
        email: request.email,
        password: passwordHashed,
    }
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const collection = db.collection("users");
        let insert = await collection.insertOne(user)
            .catch(err => console.error(err));
        if (insert) {
            const query = {
                login: user.login,
                password: user.password
            };
            const project = { _id: 1, name: 1 };
            let newUser = await findOne(query, project)
                .catch(err => console.error(err));
            if (newUser) {
                let authToken = await generateAuthToken(newUser._id);
                return { name: user.name, auth: authToken };
            } else {
                return { error: "Ошибка хз вообще чего" };
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

async function generateAuthToken(userId) {
    const md5sum = crypto.createHash('md5');
    let authToken = md5sum.update(Math.random().toString()).digest('hex');
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const collection = db.collection("users");
        let result = await collection
            .count({ authToken: authToken })
            .catch(err => console.error(err));
        // console.log(result);
        if (result === 0) {
            console.log(userId);
            await collection.updateOne({ _id: userId }, {
                $set: {
                    authToken: authToken
                }
            });
        } else {
            console.log('Надо было поменять токен');
        }
        return authToken;
    } catch (err) {
        // console.log("Возникла ошибка");
        console.error(err);
    } finally {
        await mongoClient.close();
        // console.log("Подключение закрыто");
    }
}

async function logout(authToken) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const collection = db.collection("users");
        let result = await collection
            .updateOne({ authToken: authToken }, {
                $unset: { authToken: '' }
            })
            .catch(err => console.error(err));
        return { ok: 1 };
    } catch (err) {
        // console.log("Возникла ошибка");
        console.error(err);
    } finally {
        await mongoClient.close();
        // console.log("Подключение закрыто");
    }
}