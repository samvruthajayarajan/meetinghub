const { MongoClient } = require('mongodb');

async function listDatabases() {
  const client = new MongoClient('mongodb://localhost:27017/?directConnection=true');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const admin = client.db('admin');
    const result = await admin.admin().listDatabases();
    
    console.log('\n=== Available Databases ===');
    result.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check each database for users collection
    console.log('\n=== Checking for User Collections ===');
    for (const dbInfo of result.databases) {
      if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') {
        continue;
      }
      
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      const hasUsers = collections.some(c => c.name === 'User');
      
      if (hasUsers) {
        const userCount = await db.collection('User').countDocuments();
        console.log(`✓ ${dbInfo.name} - Has User collection with ${userCount} users`);
        
        // Show first few users
        const users = await db.collection('User').find({}).limit(5).toArray();
        users.forEach(u => {
          console.log(`  - ${u.email} (${u.name})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

listDatabases();
