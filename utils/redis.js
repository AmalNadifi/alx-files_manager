import { createClient } from 'redis';
import { promisify } from 'util';

// This is the class to interact with Redis
class RedisClient {
  constructor() {
	// Create Redis client  
    this.client = createClient();
	// Handle Redis client errors
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to server: ${error}`);
    });
  }

  // Check if Redis client is connected
  isAlive() {
    if (this.client.connected) {
      return true;
    }
    return false;
  }

  // Get the value for given key from Redis
  async get(key) {
    const redisGetAsync = promisify(this.client.get).bind(this.client);
    const value = await redisGetAsync(key);
    return value;
  }

  // Set key-value pair in Redis with expiration time in seconds
  async set(key, value, expTime) {
    const redisSetAsync = promisify(this.client.set).bind(this.client);
    await redisSetAsync(key, value);
    await this.client.expire(key, expTime);
  }

  // Delete a key-value pair from Redis
  async del(key) {
    const redisDelAsync = promisify(this.client.del).bind(this.client);
    await redisDelAsync(key);
  }
}

// Create an instance of RedisClient
const redisClient = new RedisClient();

// Export the Redis client instance for use in other modules
module.exports = redisClient;
