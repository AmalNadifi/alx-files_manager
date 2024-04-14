import sha1 from 'sha1'; // Importing the sha1 hashing function
import { v4 as uuidv4 } from 'uuid'; // Importing UUID v4 generator
import dbClient from '../utils/db'; // Importing the database client
import redisClient from '../utils/redis'; // Importing the Redis client for caching

class AuthController {
  // Method to handle user authentication
  static async getConnect(request, response) {
    // Extracting authorization data from the request headers
    const authData = request.header('Authorization');
    let userEmail = authData.split(' ')[1]; // Extracting email from authData
    // Decoding base64 encoded email
    const buff = Buffer.from(userEmail, 'base64');
    userEmail = buff.toString('ascii');
    // Splitting email and password
    const data = userEmail.split(':');
    // Checking if email and password are both present
    if (data.length !== 2) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Hashing the password using SHA1
    const hashedPassword = sha1(data[1]);
    const users = dbClient.db.collection('users'); // Accessing the 'users' collection in the database
    // Finding a user with the provided email and hashed password
    users.findOne({ email: data[0], password: hashedPassword }, async (err, user) => {
      if (user) {
        // Generating a unique token using UUID v4
        const token = uuidv4();
        const key = `auth_${token}`;
        // Storing the token-userId mapping in Redis cache with a TTL of 24 hours (60 * 60 * 24 seconds)
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
        // Sending the token as a response
        response.status(200).json({ token });
      } else {
        // If user is not found, sending Unauthorized error
        response.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  // Method to handle user disconnection
  static async getDisconnect(request, response) {
    const token = request.header('X-Token'); // Extracting token from request headers
    const key = `auth_${token}`; // Constructing the Redis key for the token
    // Retrieving userId associated with the token from Redis cache
    const id = await redisClient.get(key);
    if (id) {
      // If userId exists, removing the token from Redis cache
      await redisClient.del(key);
      // Sending success response with no content (204 No Content)
      response.status(204).json({});
    } else {
      // If token not found or expired, sending Unauthorized error
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController; // Exporting the AuthController class
