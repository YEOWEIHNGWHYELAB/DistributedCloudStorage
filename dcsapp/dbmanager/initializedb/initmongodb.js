const { MongoClient } = require('mongodb');


async function mongoDBConnector(uriMongoDB) {
    const mongoClient = new MongoClient(uriMongoDB, { useUnifiedTopology: true });
    await mongoClient.connect();
    const mongoClientDB = mongoClient.db('mydatabase');

    const serverTime = await mongoClientDB.command({ serverStatus: 1 });

    console.log('Connected to MongoDB at ' + serverTime.localTime);

    return mongoClientDB;
}

exports.mongoDBConnector = mongoDBConnector;
