import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// Controller for handling application-level requests
class AppController {
  static getStatus(request, response) {
    response.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  // Method to get statistics about users and files from the database
  static async getStats(request, response) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    // Respond with the statistics as a JSON object
    response.status(200).json({ users: usersCount, files: filesCount });
  }
}

// Export the AppController for use in other modules
module.exports = AppController;
