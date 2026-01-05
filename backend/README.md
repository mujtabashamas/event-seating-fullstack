# Backend API - User Data Service

Express.js API with advanced caching, rate limiting, and asynchronous processing.

## Features

- **LRU Cache**: In-memory cache with 60-second TTL and automatic stale entry cleanup
- **Rate Limiting**: 10 requests per minute with burst capacity of 5 requests in 10 seconds
- **Async Queue**: Handles concurrent requests efficiently, preventing duplicate database calls
- **Cache Statistics**: Track hits, misses, size, and average response time
- **Concurrent Request Handling**: Multiple requests for the same user ID wait for the first request to complete

## Installation

```bash
npm install
```

## Running

### Development (with hot reload)
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the PORT environment variable).

## API Endpoints

### GET /users/:id
Retrieve user data by ID. Returns cached data if available, otherwise simulates a database call (200ms delay).

**Example:**
```bash
curl http://localhost:3000/users/1
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### POST /users
Create a new user (bonus feature).

**Example:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Smith", "email": "bob@example.com"}'
```

### GET /cache/status
Get cache statistics (bonus feature).

**Example:**
```bash
curl http://localhost:3000/cache/status
```

**Response:**
```json
{
  "size": 3,
  "hits": 10,
  "misses": 5,
  "hitRate": 66.67,
  "averageResponseTime": 45.2
}
```

### DELETE /cache
Clear the entire cache (bonus feature).

**Example:**
```bash
curl -X DELETE http://localhost:3000/cache
```

### GET /health
Health check endpoint.

## Rate Limiting

- Maximum 10 requests per minute per IP address
- Burst capacity: 5 requests in a 10-second window
- Returns `429 Too Many Requests` when limit is exceeded
- Rate limit headers included in responses:
  - `X-RateLimit-Remaining`: Number of requests remaining
  - `X-RateLimit-Reset`: ISO timestamp when the limit resets

## Architecture

### Caching Strategy
- **LRU (Least Recently Used)** cache implementation
- 60-second TTL (Time To Live) for cached entries
- Automatic background cleanup every 10 seconds
- Cache statistics tracking (hits, misses, size, average response time)
- Only caches data if not already cached (prevents overwriting)

### Concurrent Request Handling
- Uses an async queue to handle concurrent requests for the same user ID
- If multiple requests arrive for the same user ID simultaneously:
  1. First request fetches from database and caches the result
  2. Subsequent requests wait for the first request to complete
  3. All requests receive the cached result

### Rate Limiting Implementation
- Token bucket-like algorithm with two windows:
  - Per-minute window (10 requests)
  - Burst window (5 requests in 10 seconds)
- Uses IP address as identifier (can be extended to use user ID or API key)
- Automatic cleanup of old rate limit records

## Testing

Use Postman, curl, or any API testing tool to test the endpoints.

### Test Scenarios

1. **First Request** (cache miss):
   ```bash
   curl http://localhost:3000/users/1
   # Response time: ~200ms (simulated database delay)
   ```

2. **Subsequent Request** (cache hit):
   ```bash
   curl http://localhost:3000/users/1
   # Response time: <10ms (from cache)
   ```

3. **Concurrent Requests**:
   ```bash
   # Run multiple requests simultaneously
   curl http://localhost:3000/users/1 &
   curl http://localhost:3000/users/1 &
   curl http://localhost:3000/users/1 &
   # All requests will share the same database call
   ```

4. **Rate Limiting**:
   ```bash
   # Make 11 requests quickly
   for i in {1..11}; do curl http://localhost:3000/users/1; done
   # 11th request should return 429
   ```

5. **Cache Status**:
   ```bash
   curl http://localhost:3000/cache/status
   ```

## Error Handling

- **400 Bad Request**: Invalid user ID format
- **404 Not Found**: User ID doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server errors

## TypeScript Configuration

- Strict mode enabled
- ES2022 target
- Node.js module resolution
- Source maps enabled for debugging

