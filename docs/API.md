# 📡 FocusFlow API Documentation

Base URL: `http://localhost:4000/api/v1` (development)  
Production: `https://api.focusflow.com/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Authentication Endpoints

### Register

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "proStatus": false,
    "createdAt": "2024-03-20T10:00:00.000Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "proStatus": false
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Refresh Token

**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Logout

**POST** `/auth/logout`

**Headers:** `Authorization: Bearer TOKEN`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Task Endpoints

### Get Tasks

**GET** `/tasks?page=1&limit=20&status=ACTIVE&priority=HIGH`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): ACTIVE | COMPLETED
- `priority` (optional): LOW | MEDIUM | HIGH
- `sortBy` (optional): createdAt | dueDate | priority (default: createdAt)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clx456def",
      "title": "Complete project proposal",
      "dueDate": "2024-03-25T00:00:00.000Z",
      "priority": "HIGH",
      "status": "ACTIVE",
      "createdAt": "2024-03-20T10:00:00.000Z",
      "focusSessionsCount": 3
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Get Next Task

**GET** `/tasks/next`

Returns the next task to work on based on smart prioritization.

**Response:** `200 OK`
```json
{
  "id": "clx456def",
  "title": "Complete project proposal",
  "dueDate": "2024-03-25T00:00:00.000Z",
  "priority": "HIGH",
  "status": "ACTIVE",
  "createdAt": "2024-03-20T10:00:00.000Z",
  "focusSessionsCount": 3
}
```

### Create Task

**POST** `/tasks`

**Request Body:**
```json
{
  "title": "Write documentation",
  "dueDate": "2024-03-30T00:00:00.000Z",
  "priority": "MEDIUM"
}
```

**Response:** `201 Created`
```json
{
  "id": "clx789ghi",
  "title": "Write documentation",
  "dueDate": "2024-03-30T00:00:00.000Z",
  "priority": "MEDIUM",
  "status": "ACTIVE",
  "createdAt": "2024-03-20T11:00:00.000Z",
  "focusSessionsCount": 0
}
```

### Update Task

**PATCH** `/tasks/:id`

**Request Body:**
```json
{
  "title": "Updated title",
  "priority": "HIGH",
  "dueDate": "2024-03-28T00:00:00.000Z"
}
```

**Response:** `200 OK`

### Complete Task

**POST** `/tasks/:id/complete`

**Response:** `200 OK`

### Delete Task

**DELETE** `/tasks/:id`

**Response:** `204 No Content`

---

## Focus Session Endpoints

### Start Session

**POST** `/sessions`

**Request Body:**
```json
{
  "taskId": "clx456def"
}
```

**Response:** `201 Created`
```json
{
  "id": "cls123abc",
  "userId": "clx123abc",
  "taskId": "clx456def",
  "startedAt": "2024-03-20T14:00:00.000Z",
  "endedAt": null,
  "duration": 0,
  "completed": false,
  "task": {
    "id": "clx456def",
    "title": "Complete project proposal",
    "priority": "HIGH"
  }
}
```

### Complete Session

**POST** `/sessions/:id/complete`

**Response:** `200 OK`
```json
{
  "id": "cls123abc",
  "userId": "clx123abc",
  "taskId": "clx456def",
  "startedAt": "2024-03-20T14:00:00.000Z",
  "endedAt": "2024-03-20T14:25:00.000Z",
  "duration": 1500,
  "completed": true
}
```

### Get Sessions

**GET** `/sessions?page=1&limit=20&taskId=clx456def`

**Response:** `200 OK`

---

## Statistics Endpoints

### Get Daily Stats

**GET** `/stats/daily?date=2024-03-20`

**Query Parameters:**
- `date` (optional): YYYY-MM-DD format (default: today)

**Response:** `200 OK`
```json
{
  "id": "cld123xyz",
  "userId": "clx123abc",
  "date": "2024-03-20",
  "tasksCompleted": 5,
  "focusSessions": 8,
  "focusMinutes": 200,
  "streakCount": 12
}
```

### Get Streak

**GET** `/stats/streak`

**Response:** `200 OK`
```json
{
  "streak": 12
}
```

### Get Weekly Summary

**GET** `/stats/weekly`

**Response:** `200 OK`
```json
{
  "totalTasksCompleted": 28,
  "totalFocusSessions": 42,
  "totalFocusMinutes": 1050,
  "averageTasksPerDay": 4,
  "averageFocusMinutesPerDay": 150,
  "dailyBreakdown": [...]
}
```

### Get Monthly Summary

**GET** `/stats/monthly?year=2024&month=3`

**Response:** `200 OK`

---

## User Endpoints

### Get Profile

**GET** `/users/me`

**Response:** `200 OK`
```json
{
  "id": "clx123abc",
  "email": "user@example.com",
  "name": "John Doe",
  "proStatus": false,
  "createdAt": "2024-03-01T00:00:00.000Z",
  "lastActiveAt": "2024-03-20T14:30:00.000Z",
  "_count": {
    "tasks": 42,
    "sessions": 156
  }
}
```

### Update Profile

**PATCH** `/users/me`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`

### Change Password

**POST** `/users/change-password`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Response:** `200 OK`

### Delete Account

**DELETE** `/users/me`

**Request Body:**
```json
{
  "password": "MyPassword123"
}
```

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "This feature requires a Pro subscription"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- **Auth endpoints**: 5 requests / 15 minutes
- **API endpoints**: 100 requests / minute
- **Pro users**: 500 requests / minute

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1616161616
```

---

## Pagination

Paginated endpoints return:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "links": {
    "self": "/api/v1/tasks?page=1&limit=20",
    "next": "/api/v1/tasks?page=2&limit=20",
    "prev": null
  }
}
```

---

## Health Check

**GET** `/health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-03-20T14:30:00.000Z",
  "uptime": 3600
}
```

**GET** `/health/ready`

**Response:** `200 OK`
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "cache": "ok"
  }
}
```

---

## Postman Collection

Import the Postman collection: `docs/FocusFlow.postman_collection.json`

---

**Need help?** Open an issue on GitHub!
