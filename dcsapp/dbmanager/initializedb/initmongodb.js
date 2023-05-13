const { MongoClient } = require('mongodb');


async function testMongoDBTime(mongoClientDB) {
    const serverTime = await mongoClientDB.command({ serverStatus: 1 });
    console.log('Connected to MongoDB at ' + serverTime.localTime);
}

async function mongoDBConnector(uriMongoDB) {
    // Peforming connections to the MongoDB
    const mongoClient = new MongoClient(uriMongoDB, { useUnifiedTopology: true });
    await mongoClient.connect();
    const mongoClientDB = mongoClient.db(process.env.MONGODBNAME);

    // Collections to be used
    const mongoYTTrackCollection = mongoClientDB.collection(process.env.MONGOYTTRACK);
    const mongoYTMetaCollection = mongoClientDB.collection(process.env.MONGOYTMETA);

    // Test the connection of MongoDB
    await testMongoDBTime(mongoClientDB);

    return { mongoYTTrackCollection, mongoYTMetaCollection };
}

exports.mongoDBConnector = mongoDBConnector;
