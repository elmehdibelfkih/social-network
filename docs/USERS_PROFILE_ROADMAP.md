# Users/Profile Feature Implementation Roadmap

## 📋 Overview

This document outlines the implementation plan for the **Users/Profile** feature endpoints. The feature includes viewing profiles, updating profiles, toggling privacy, and retrieving user statistics.

## 🎯 Endpoints to Implement

1. **GET `/api/v1/users/:user_id/profile`** - Get user profile (respects privacy)
2. **PUT `/api/v1/users/:user_id/profile`** - Update own profile
3. **PATCH `/api/v1/users/:user_id/profile`** - Toggle profile privacy
4. **GET `/api/v1/users/:user_id/stats`** - Get user statistics

## 🏗️ Architecture Overview

```
Handler Layer (handler.go)
    ↓
Service Layer (service.go) - Business Logic
    ↓
Store Layer (store.go) - Database Operations
    ↓
Queries (queries.go) - SQL Statements
```

## 📝 Implementation Steps

### Step 1: Database Queries (queries.go)

#### SELECT Queries:
- `SELECT_USER_PROFILE_BY_ID` - Get full user profile data
- `SELECT_USER_PROFILE_BASIC` - Get basic profile (for privacy checks)
- `SELECT_USER_STATS` - Get posts, followers, following counts
- `SELECT_FOLLOW_STATUS` - Check if current user follows target user
- `SELECT_USER_PRIVACY` - Get user privacy setting

#### UPDATE Queries:
- `UPDATE_USER_PROFILE` - Update profile fields (firstName, lastName, nickname, aboutMe, avatarId, dateOfBirth, email)
- `UPDATE_USER_PRIVACY` - Toggle privacy between 'public' and 'private'

### Step 2: Store Functions (store.go)

**Read Operations:**
- `GetUserProfileById(userId, viewerId int64)` - Returns profile respecting privacy
- `GetUserStats(userId int64)` - Returns statistics
- `CheckFollowStatus(followerId, followingId int64)` - Returns "follow" or "unfollow"
- `GetUserPrivacy(userId int64)` - Returns privacy setting

**Write Operations:**
- `UpdateUserProfile(userId int64, updates map[string]any)` - Updates profile fields
- `UpdateUserPrivacy(userId int64, privacy string)` - Updates privacy setting

### Step 3: Service Layer (service.go)

**Business Logic Functions:**

1. **GetProfile Service:**
   - Validate user exists
   - Check privacy settings:
     - If public: show to everyone
     - If private: only show to followers or profile owner
   - Get follow status ("follow" or "unfollow")
   - Get user statistics
   - Return formatted profile response

2. **UpdateProfile Service:**
   - Validate user is updating their own profile
   - Validate fields (email uniqueness, nickname uniqueness)
   - Update database
   - Return success response

3. **TogglePrivacy Service:**
   - Validate user is updating their own profile
   - Validate privacy value ("public" or "private")
   - Update database
   - Return success response

4. **GetStats Service:**
   - Calculate posts count
   - Calculate followers count
   - Calculate following count
   - Calculate likes received
   - Calculate comments received
   - Return formatted stats response

### Step 4: Handler Layer (handler.go)

**Handler Functions:**

1. **GetProfile Handler:**
   - Extract `user_id` from URL path
   - Get current user from context (may be 0 if not logged in)
   - Call service layer
   - Return JSON response

2. **PutProfile Handler:**
   - Extract `user_id` from URL path
   - Get current user from context
   - Validate JSON request body
   - Validate user owns the profile
   - Call service layer
   - Return JSON response

3. **PatchProfile Handler:**
   - Extract `user_id` from URL path
   - Get current user from context
   - Validate JSON request body
   - Validate user owns the profile
   - Call service layer
   - Return JSON response

4. **GetStats Handler:**
   - Extract `user_id` from URL path
   - Get current user from context
   - Call service layer
   - Return JSON response

### Step 5: Middleware (middleware.go)

**Privacy Middleware:**
- Check if profile is private
- If private and viewer is not a follower/owner, return 403 Forbidden
- Otherwise, allow request to proceed

**Note:** Privacy checks can also be done in the service layer for better separation of concerns.

## 🔐 Privacy Rules

### Public Profile:
- ✅ Visible to everyone
- ✅ Shows all profile information
- ✅ Shows all posts (based on post privacy)

### Private Profile:
- ✅ Visible only to:
  - Profile owner
  - Followers (who are following the profile owner)
- ❌ Not visible to:
  - Non-followers
  - Unauthenticated users

## 📊 Response Structures

### GET Profile Response:
```json
{
  "success": true,
  "payload": {
    "userId": 1289843874339,
    "status": "follow", // "follow" or "unfollow"
    "nickname": "nickname",
    "firstName": "first",
    "lastName": "last",
    "avatarId": 1289843874780,
    "aboutMe": "Full-stack developer...",
    "dateOfBirth": "2001-01-01",
    "privacy": "public",
    "stats": {
      "postsCount": 123,
      "followersCount": 890,
      "followingCount": 215
    },
    "joinedAt": "2022-05-12T09:00:00Z"
  }
}
```

### PUT Profile Request:
```json
{
  "firstName": "first",
  "lastName": "last",
  "nickname": "nickname",
  "aboutMe": "Cloud and DevOps engineer...",
  "avatarId": 1289843874780,
  "dateOfBirth": "2001-01-01",
  "email": "email@example.com"
}
```

### PATCH Profile Request:
```json
{
  "privacy": "private"
}
```

### GET Stats Response:
```json
{
  "success": true,
  "payload": {
    "userId": 1289843874339,
    "postsCount": 128,
    "followersCount": 954,
    "followingCount": 312,
    "likesReceived": 2401,
    "commentsReceived": 782
  }
}
```

## 🧪 Testing Checklist

### GET Profile:
- [ ] Public profile visible to anyone
- [ ] Private profile visible to owner
- [ ] Private profile visible to followers
- [ ] Private profile NOT visible to non-followers
- [ ] Follow status correctly returned
- [ ] Stats correctly calculated

### PUT Profile:
- [ ] Owner can update their profile
- [ ] Non-owner cannot update profile (403)
- [ ] Email uniqueness validated
- [ ] Nickname uniqueness validated
- [ ] All fields updated correctly

### PATCH Profile:
- [ ] Owner can toggle privacy
- [ ] Non-owner cannot toggle privacy (403)
- [ ] Privacy value validated ("public" or "private")

### GET Stats:
- [ ] Stats correctly calculated
- [ ] All counts accurate

## 📁 File Structure

```
backend/pkg/services/users/
├── defs.go          - Request/Response structs
├── queries.go       - SQL queries
├── store.go         - Database operations
├── service.go       - Business logic
├── handler.go       - HTTP handlers
└── middleware.go    - Privacy/Authorization middleware
```

## 🔄 Data Flow

1. **Request** → Handler extracts params/body
2. **Handler** → Validates request format
3. **Handler** → Calls Service layer
4. **Service** → Applies business logic (privacy checks, validation)
5. **Service** → Calls Store layer
6. **Store** → Executes SQL queries
7. **Store** → Returns data to Service
8. **Service** → Formats response
9. **Handler** → Returns JSON response

## 🚨 Error Handling

- **404 Not Found**: User doesn't exist
- **403 Forbidden**: Privacy violation or unauthorized update
- **400 Bad Request**: Invalid JSON or validation errors
- **401 Unauthorized**: Not authenticated (for protected endpoints)
- **500 Internal Server Error**: Database or server errors

## 📝 Notes

- Profile privacy check should be done in service layer for reusability
- Follow status is "follow" if current user doesn't follow, "unfollow" if they do
- Stats should be calculated from actual database counts
- All timestamps should follow ISO-8601 format
- Email and nickname must be unique across all users

