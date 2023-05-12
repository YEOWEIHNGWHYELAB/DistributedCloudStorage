const { MongoClient } = require('mongodb');


async function testMongoDBTime(mongoClientDB) {
    const serverTime = await mongoClientDB.command({ serverStatus: 1 });
    console.log('Connected to MongoDB at ' + serverTime.localTime);
}

async function mongoDBConnector(uriMongoDB) {
    const mongoClient = new MongoClient(uriMongoDB, { useUnifiedTopology: true });
    await mongoClient.connect();
    const mongoClientDB = mongoClient.db(process.env.MONGODBNAME);

    await testMongoDBTime(mongoClientDB);

    return mongoClientDB;
}

exports.mongoDBConnector = mongoDBConnector;
