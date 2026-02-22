const { MongoClient } = require('mongodb');

async function initReplicaSet() {
  const client = new MongoClient('mongodb://localhost:27017/?directConnection=true');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const admin = client.db('admin');
    const result = await admin.command({
      replSetInitiate: {
        _id: 'rs0',
        members: [{ _id: 0, host: 'localhost:27017' }]
      }
    });
    
    console.log('Replica set initialized:', result);
  } catch (error) {
    if (error.message.includes('already initialized')) {
      console.log('Replica set already initialized');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await client.close();
  }
}

initReplicaSet();
