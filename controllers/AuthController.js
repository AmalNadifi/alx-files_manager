import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
	// Method to handle user authentication
	static async getConnect(request, response) {
		// Extracting authorization data from the request headers
		const authData = request.header('Authorization');
		let userEmail = authData.split(' ')[1];
		// Decoding base64 encoded email
		const buff = Buffer.from(userEmail, 'base64');
		userEmail = buff.toString('ascii');
		// Splitting email and password
		const data = userEmail.split(':');
		// Checking if email and password are both present
		if (data.length !== 2) {
			response.status(401).json({ error: 'Unauthorized' });
			return;
		} // Hashing the password using SHA1
		const hashedPassword = sha1(data[1]);
		const users = dbClient.db.collection('users');
		// Finding a user with the provided email and hashed password
		users.findOne({ email: data[0], password: hashedPassword }, async (err, user) => {
			if (user) {
				// Generating a unique token using UUID v4
				const token = uuidv4();
				const key = `auth_${token}`;
				await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
				response.status(200).json({ token });
			} else {
				response.status(401).json({ error: 'Unauthorized' });
			}
		});
	} // Method to handle user disconnection

	static async getDisconnect(request, response) {
		const token = request.header('X-Token');
		const key = `auth_${token}`;
		// Retrieving userId associated with the token from Redis cache
		const id = await redisClient.get(key);
		if (id) {
			// If userId exists, removing the token from Redis cache
			await redisClient.del(key);
			response.status(204).json({});
		} else {
			response.status(401).json({ error: 'Unauthorized' });
		}
	}
}
// Exporting the AuthController class
module.exports = AuthController;
