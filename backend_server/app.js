const { MongoClient } = require("mongodb");
const fs = require('fs');
const { parse } = require('json2csv');
const { promisify } = require('util');

const mkdirAsync = promisify(fs.mkdir);

async function run() {
  // Replace the placeholder connection string below with your Atlas cluster specifics.
  const uri =
    "mongodb+srv://med-dash-deploy:passwordisGood@cluster0.ludjpq9.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    const dbName = "med-dash-user-data";

    const database = client.db(dbName);

    // Get all collection names in the database
    const collections = await database.listCollections().toArray();

    // Create a directory to store CSV files
    await mkdirAsync('data', { recursive: true });

    // Iterate over each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = database.collection(collectionName);

      // Fetch all documents from the collection
      const documents = await collection.find().toArray();
      // console.log(documents)
      // // Convert documents to CSV format
      const csv = parse(documents);
      console.log(csv)
      // // Write CSV data to a file
      // const filename = `data/${collectionName}.csv`;
      // fs.writeFileSync(filename, csv, 'utf-8');

      // console.log(`CSV file ${filename} has been created successfully.`);
    }
  } catch (err) {
    console.error(`Something went wrong: ${err}`);
  } finally {
    await client.close();
  }
}

run().catch(console.error);

