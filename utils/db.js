import { MongoClient } from 'mongodb';

// Default values for the MongoDB connection
const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${HOST}:${PORT}`;

// Class to interact with MongoDB
class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });
    this.client.connect().then(() => {
      this.db = this.client.db(`${DATABASE}`);
    }).catch((err) => {
      console.log(err);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  // Get the number of documents in the users collection
  async nbUsers() {
    const users = this.db.collection('users');
    const usersCount = await users.countDocuments();
    return usersCount;
  }

  async nbFiles() {
    const files = this.db.collection('files');
    const filesCount = await files.countDocuments();
    return filesCount;
  }
}

// Create an instance of DBClient
const dbClient = new DBClient();

// Export the MongoDB client instance for use in other modules
module.exports = dbClient;
