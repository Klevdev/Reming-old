const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const mongoClient = new MongoClient('mongodb://localhost:27017/reming');

async function login(request) {
    const md5sum = crypto.createHash('md5');
    const passwordHashed = md5sum.update(request.password).digest('hex');
    const query = {
        login: request.login,
        password: passwordHashed
    };
    const project = { _id: 1, name: 1 };
    let user = await findOne(query, project)
        .catch(err => console.error(err));
    if (user) {
        let authToken = await generateAuthToken(user._id);
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
    return user;
    // try {
    //     await mongoClient.connect();
    //     const db = mongoClient.db("reming");
    //     const collection = db.collection("users");
    //     let insert = await collection.insertOne(user)
    //         .catch(err => console.error(err));
    //     if (insert) {
    //         const query = {
    //             login: user.login,
    //             password: user.password
    //         };
    //         const project = { _id: 1, name: 1 };
    //         let newUser = await findOne(query, project)
    //             .catch(err => console.error(err));
    //         if (newUser) {
    //             let authToken = await generateAuthToken(newUser._id);
    //             return { name: user.name, auth: authToken };
    //         } else {
    //             return { error: "Ошибка хз вообще чего" };
    //         }
    //     } else {
    //         return { error: "Ошибка записи в БД" };
    //     }
    // } catch (err) {
    //     console.error(err);
    // } finally {
    //     await mongoClient.close();
    // }
}

async function findOne(query, project) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const collection = db.collection("users");
        let result = await collection
            .find(query)
            .project(project)
            .toArray()
            .then(res => res[0])
            .catch(err => console.error(err));
        // console.log(result);
        return result;
    } catch (err) {
        // console.log("Возникла ошибка");
        console.error(err);
    } finally {
        await mongoClient.close();
        // console.log("Подключение закрыто");
    }
}

async function generateAuthToken(userId) {
    let authToken = Math.random().toString();
    try {
        await mongoClient.connect();
        const db = mongoClient.db("reming");
        const collection = db.collection("users");
        let result = await collection
            .count({ authToken: authToken })
            .catch(err => console.error(err));
        // console.log(result);
        if (result === 0) {
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

module.exports = { findOne, login, logout, signup };