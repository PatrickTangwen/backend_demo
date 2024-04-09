// server.js
const express = require('express');
const { MongoClient } = require("mongodb");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const uri =
""; // placeholder for mongodb uri

const client = new MongoClient(uri, { useUnifiedTopology: true });


async function connectToMongoDB() {
    try {
        await client.connect();
      } 
      catch (err) {
        console.error(`Something went wrong: ${err}`);
      }

}

connectToMongoDB();
//enable CORS for all routes in Express.js application. 
//This allows requests from any origin to access the endpoints.
app.use(cors());

var cal = "";
// Define health check endpoint
app.get('/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
});

// Function to handle fetching data from MongoDB based on collection name
async function fetchDataFromCollection(req, res, collectionName) {
    try {
        const dbName = "med-dash-user-data";
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        
        // Fetch all documents from the collection
        const documents = await collection.find().toArray();
        let csvData = ["unit", "timestamp", "start", "end", "value"].join(",") + "\r\n"
        documents.forEach((doc) => {
            // populating the CSV content
            // and converting the null fields to ""
            csvData += [doc.unit, doc.timestamp, doc.start,doc.end,doc.value].join(",") + "\r\n"
          })
         // returning the CSV content via the "users.csv" file
        res
        .set({
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${collectionName}.csv"`,
        })
        .send(csvData)
    } catch (error) {
        console.error(`Error fetching data from MongoDB for collection ${collectionName}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Define routes
app.get('/api/data/calories', async (req, res) => {
    return await fetchDataFromCollection(req, res, "calories_active");
});

app.get('/api/data/distance', async (req, res) => {
    return await fetchDataFromCollection(req, res, "distance");
});

app.get('/api/data/heartrate', async (req, res) => {
    return await fetchDataFromCollection(req, res, "heartrate");
});

app.get('/api/data/steps', async (req, res) => {
    return await fetchDataFromCollection(req, res, "steps");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
