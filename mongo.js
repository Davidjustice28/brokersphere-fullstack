const {MongoClient} = require('mongodb')

const uri ='mongodb+srv://brokersphere-data:realestate-agent@brokersphere.gudt4.mongodb.net/?retryWrites=true&w=majority'

const client = new MongoClient(uri,{useNewUrlParser: true, useUnifiedTopology: true,})
const getMongoData = async() => {
    try {
        await client.connect()
        console.log('connected to database')
        const data = await getAgents()
        return data

    }
    catch(err) {
        console.log(err)
    }
}

async function getAgents() {
    //const dbs = await client.db().admin().listDatabases()
    const db = await client.db('test_data').collection('users')
    const agents = await db.find().toArray()
    return agents
}


const addAgentToMongo = async (doc) => {
    try {
      const database = client.db("test_data");
      const agentsCollection = database.collection("users");
      // create a document to insert
      const result = await agentsCollection.insertOne(doc);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
      await client.close();
    }
  }



module.exports.connect = getMongoData
module.exports.addAgentToMongo = addAgentToMongo