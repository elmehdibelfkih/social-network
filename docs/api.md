# SOCIAL-NETWORK API

## Response structure

***Successful***

```json
{
  "success": true,
  "payload": {
    /* Application-specific data would go here. */
  },
}
```

***Failed***

```json
{
  "success": false,
  "payload": {},
  "error": {
    "StatusCode": 404,
    "StatusText": "Not Found",
    "ErrorMessage": "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
    "ErrorTitle": "Oops! Page Not Found",
    "ErrorDescription": "We couldn't find the page you were looking for. Please check the URL for any mistakes or go back to the homepage.",
    "errorType": "redirect"
  }
}
```

> - Note ⚠️: The JSON examples are illustrative. Replace the payload content with your actual data structure.
> - Note ⚠️: In case of an error, the errorType field can have the values "redirect" or "alert".
> - Note ⚠️: The payload keys follow camelCase convention.

---

## 🔴 Auth / Sessions

### POST `/api/v1/auth/register` => create account

***status code in success: 200***

- request

```json
{
  "email": "email@example.com",
  "password": "Pa$$w0rd!",
  "firstName": "first",
  "lastName": "last",
  "dateOfBirth": "2001-01-01",
  "nickname": "nickname", // optinal
  "aboutMe": "present who you are and what you do.", // optinal
  "avatarId": 23456754324567 // optinal
}
```

- response payload

``` json
{
  "userId": 1289843874339,
  "email": "email@example.com",
  "firstName": "first",
  "lastName": "last",
  "dateOfBirth": "2001-01-01",
  "nickname": "nickname", // or null
  "aboutMe": "present who you are and what you do.", // or null
  "avatarId": 23456754324567 // or null
}
```

> - Note⚠️: nickname/email/userId must be unique

---

### POST `/api/v1/auth/login` => create session (sets HttpOnly session cookie)

***status code in success: 200***

- request

```json
{
  "email/userId/nickname": "email@example.com", // or 1289843874339 or nickname",
  "password": "Pa$$w0rd!",
  "rememberMe":true
}
```

- response payload

``` json
{
  "userId": 1289843874339,
  "email": "email@example.com",
  "firstName": "first",
  "lastName": "last",
  "dateOfBirth": "2001-01-01",
  "nickname": "nickname", // or null
  "aboutMe": "present who you are and what you do.", // or null
  "avatarId": 23456754324567 // or null
}
```

---

### POST `/api/v1/auth/logout` => destroy current session

***status code in success: 203***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Logout successful.",
}
```

---

### GET `/api/v1/auth/session` => validate session / return current user

***status code in success: 200***

- response payload

``` json
 {
    "sessionId": 1289843874339,
    "sessionToken": "c69fcb3c0c9b4baf9b41b82efdd7a2ad",
    "ipAddress": "192.168.1.12",
    "device": "Firefox/Linux",
    "createdAt": "2025-10-24T17:15:00Z",
    "expiresAt": "2025-11-24T17:15:00Z"
  }
```

---

### GET `/api/v1/sessions` => list active sessions for current user

***status code in success: 200***

- response payload

``` json

  [
    {
      "sessionId": 1289843874339,
      "ipAddress": "192.168.1.12",
      "device": "Firefox/Linux",
      "createdAt": "2025-10-20T12:45:00Z",
      "expiresAt": "2025-11-20T12:45:00Z",
      "current": true
    },
    {
      "sessionId": 1289843874330,
      "ipAddress": "10.0.0.5",
      "device": "Chrome/Android",
      "createdAt": "2025-10-18T09:15:00Z",
      "expiresAt": "2025-11-18T09:15:00Z",
      "current": false
    }
  ]

```

> - Note ⚠️: the request body contains an array of sessions

---

### DELETE `/api/v1/sessions/:session_id` => revoke specific session

***status code in success: 200***

- response payload

``` json
{
  "message": "Logout successful.",
}
```

---

## 🔴 Users / Profiles

### GET `/api/v1/users/:user_id/profile` => get public/profile view (respect privacy)

***status code in success: 200***

- response payload

``` json
{
  "userId": 1289843874339, // the user id of the profile owner 
  "status": "follow", // follow/unfollow or null if the user is the owner of the profile
  "nickname": "nickname", // or null
  "firstName": "first",
  "lastName": "last",
  "avatarId": 1289843874780, // or null
  "aboutMe": "Full-stack developer and cloud enthusiast.", // or null
  "dateOfBirth": "2001-01-01",
  "privacy": "public",
  "stats": {
    "postsCount": 123,
    "followersCount": 890,
    "followingCount": 215
  },
  "joinedAt": "2022-05-12T09:00:00Z"
}
```

> - Note⚠️: The status key includes the state of the follower/following relationship between the current user and the user that owns the profile.
> - Note⚠️: If the user already follows the owner of the profile. The status key must be 'unfollow'.

---

### PATCH `/api/v1/users/:user_id/profile` => update own profile

***status code in success: 200***

- request

```json
{
  "firstName": "first",  // optinal
  "lastName": "last",  // optinal
  "nickname": "nickname",  // optinal
  "aboutMe": "Cloud and DevOps engineer passionate about scalable systems.", // optinal
  "dateOfBirth": "2001-01-01", // optinal
  "email": "email@example.com"  // optinal
}
```
  
> - Note⚠️: At least one of those fields must be present.

- response payload

``` json
{
  "message": "Updated successful."
}
```

---

### PATCH `/api/v1/users/:user_id/privacy` => toggle public/private profile

***status code in success: 200***

- request

```json
{
  "privacy": "private"
}
```

- response payload

``` json
{
  "message": "Profile privacy updated successfully.",
  "privacy": "private"
}
```

---

### GET `/api/v1/users/:user_id/stats` => counts

***status code in success: 200***

- response payload

``` json
{
  "userId": 1289843874339,
  "postsCount": 128,
  "followersCount": 954,
  "followingCount": 312,
  "likesReceived": 2401,
  "commentsReceived": 782
}
```

---

## 🔴 Followers / Follow Requests

### POST `/api/v1/users/:user_id/follow` => send follow request or follow immediately if target is public

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Follow request sent successfully.",
  "status": "pending",
  "targetUserId": 1289843874339,
  "followerId": 1289843874336,
}
```

> - Note ⚠️: If the target user has a public profile, the response changes to:
> - {
> - "message": "You are now following this user.",
> - "status": "accepted"
> - }

---

### POST `/api/v1/users/:user_id/unfollow` => unfollow

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Unfollow successful.",
  "targetUserId": 1289843874339,
  "followerrId": 1289843874336,
}
```

---

### GET `/api/v1/users/:user_id/followers` => list followers

***status code in success: 200***

- response payload

``` json

  [
    {
      "userId": 1289843874323,
      "nickname": "alice123",
      "firstName": "Alice",
      "lastName": "Johnson",
      "avatarId": 5956843825683,
      "followedAt": "2025-10-10T12:00:00Z",
      "status": "accepted"
    },
    {
      "userId": 1289843874334,
      "nickname": "bob_dev",
      "firstName": "Bob",
      "lastName": "Smith",
      "avatarId": 5956843825683,
      "followedAt": "2025-10-12T15:30:00Z",
      "status": "accepted"
    }
  ]

```

---

### GET `/api/v1/users/:user_id/following` => list followees

***status code in success: 200***

- response payload

``` json

  [
    {
      "userId": 1289843874323,
      "nickname": "alice123",
      "firstName": "Alice",
      "lastName": "Johnson",
      "avatarId": 5956843825683,
      "followedAt": "2025-10-10T12:00:00Z",
      "status": "accepted" // pending/accepted/declined
    },
    {
      "userId": 1289843874334,
      "nickname": "bob_dev",
      "firstName": "Bob",
      "lastName": "Smith",
      "avatarId": 5956843825683,
      "followedAt": "2025-10-12T15:30:00Z",
      "status": "accepted" // pending/accepted/declined
    }
  ]

```

---

### GET `/api/v1/follow-requests` => list received follow requests for current user

***status code in success: 200***

- response payload

``` json

  [
    {
      "userId": 6249843274333,
      "nickname": "alice123",
      "firstName": "Alice",
      "lastName": "Johnson",
      "avatarId": 5956843825683,
      "followedAt": "2025-10-20T14:30:00Z",
      "status": "pending"
    },
    {
      "userId": 3489443834339,
      "nickname": "bob_dev",
      "firstName": "Bob",
      "lastName": "Smith",
      "avatarId": 5956843825683,
      "followedAt": "2025-10-21T10:15:00Z",
      "status": "pending"
    }
  ]

```

---

### POST `/api/v1/follow-requests/:user_id/accept` => accept request

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Follow request accepted successfully.",
  "followerId": 5389143874311,
  "followedId": 1289843874339, // the current user
  "status": "accepted",
}
```

---

### POST `/api/v1/follow-requests/:user_id/decline` => decline request

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Follow request declined successfully.",
  "followerId": 5389143874311,
  "followedId": 1289843874339, // the current user,
  "status": "declined",
}
```

---

## 🔴 Feed

### GET `GET /api/v1/feed?page=1&limit=20` => paginated personal feed (public + followees + groups + allowed private)

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json

  [
    {
      "postId": 3389843874075,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev", // or null
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Deploying a new Go microservice!",
      "mediaIds": [23456543456787654], // or null
      "privacy": "followers",
      "createdAt": "2025-10-24T15:00:00Z",
      "updatedAt": "2025-10-24T15:00:00Z",
      "groupId": 98765789765789 // or null
    },
    {
      "postId": 8689843874069,
      "authorId": 1289843874339,
      "authorNickname": "diana_ops",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Cloud architecture tips.",
      "mediaIds": null,
      "privacy": "public",
      "createdAt": "2025-10-23T18:20:00Z",
      "updatedAt": "2025-10-23T18:20:00Z",
      "groupId": null
    }
  ]

```

---

### GET `/api/v1/users/:user_id/feed?page=1&limit=20` => view specific user’s visible posts (respect privacy)

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json
  [
    {
      "postId": 1289843874332,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Working on a new distributed system...",
      "mediaIds": null,
      "privacy": "public",
      "createdAt": "2025-10-24T12:30:00Z",
      "updatedAt": "2025-10-24T12:30:00Z"
    },
    {
      "postId": 1289843874658,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Private note only visible to followers.",
      "mediaIds": null,
      "privacy": "followers",
      "createdAt": "2025-10-23T17:05:00Z",
      "updatedAt": "2025-10-23T17:05:00Z"
    }
  ]

```

---

### GET `/api/v1/groups/:group_id/feed?page=1&limit=20` => group feed (members only)

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json
  [
    {
      "postId": 1289843874332,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Working on a new distributed system...",
      "mediaIds": [1234567890987],
      "privacy": "public",
      "createdAt": "2025-10-24T12:30:00Z",
      "updatedAt": "2025-10-24T12:30:00Z"
    },
    {
      "postId": 1289843874658,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Private note only visible to followers.",
      "mediaIds": null,
      "privacy": "followers",
      "createdAt": "2025-10-23T17:05:00Z",
      "updatedAt": "2025-10-23T17:05:00Z"
    }
  ]

```

---

## 🔴 Posts / Comments / Reactions

### POST `/api/v1/posts` => create post (body: content, privacy, allowed_list, group_id, media_ids)

***status code in success: 201***

- request

```json
{
  "content": "Hello world — launching my new service today!",
  "privacy": "public", // public, followers, private, group, restricted.
  "allowedList": [1289843874658, 1289843874658], // exists only if the privacy is restricted.
  "groupId": 2345678654, // optinal
  "mediaIds": [1289843874657, 1289843872746] // optinal
}
```

- response payload

``` json
{
  "message": "Post created successfully.",
  "postId": 128984387246925,
  "authorId": 1289843892780,
  "privacy": "public", // public, followers, private, group, restricted.
  "groupId": null, // or the id of the group
  "mediaIds": [1289843874657, 1289843872746], // or null
  "createdAt": "2025-10-24T19:30:00Z"
}
```

> - Note ⚠️: Upload media before creating a post.
> - Note ⚠️: Each file must be uploaded to POST /api/v1/media first to get a mediaId.
> - Note ⚠️: Then include those mediaIds in POST /api/v1/posts under mediaIds.

---

### GET `/api/v1/posts/:post_id` => get a single post (respect privacy)

***status code in success: 200***

- response payload

``` json
{
  "postId": 128984387246925,
  "authorId": 128984387246929,
  "authorNickname": "devops_mehdi", // or null
  "authorlastName": "alice",
  "authorFirstName": "khalifa",
  "content": "Hello world — launching my new service today!",
  "mediaIds": [1289843874657, 1289843872746], // or null
  "privacy": "public",
  "groupId": null,
  "allowedList": null,
  "createdAt": "2025-10-24T19:30:00Z",
  "updatedAt": "2025-10-24T19:30:00Z"
}

```

---

### PATCH `/api/v1/posts/:post_id` => update own post

***status code in success: 200***

- request

```json
{
  "content": "Updated post content here...", // optional
  "privacy": "followers", // optional
  "allowedList": [128984387246925, 128984387246925], // optional
  "mediaIds": [1289843874657, 1289843872746], // optional
}
```

> - Note⚠️: At least one of those fields must be present.

- response payload

``` json
{
  "message": "Post updated successfully.",
  "post": {
    "postId": 128984387246925,
    "authorId": 128984387246925,
    "content": "Updated post content here...",
    "mediaIds": [1289843874657, 1289843872746], // or null
    "privacy": "restricted",
    "allowedList": [128984387246925, 128984387246925], // or null if the privacy not restricted
    "groupId": null, // or group id if the post belongs to a group
    "createdAt": "2025-10-24T19:30:00Z",
    "updatedAt": "2025-10-24T20:05:00Z"
  }
}
```

---

### DELETE `/api/v1/posts/:post_id` => delete own post

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Post deleted successfully."
}
```

---

### GET `/api/v1/users/:user_id/posts` => list user’s posts

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- request

```json
No need for a request body.
```

- response payload

``` json

  [
    {
      "postId": 128984387246923,
      "authorId": 128984387246925,
      "authorNickname": "charlie_dev", // or null
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Working on a new distributed system...",
      "mediaIds": [1289843874657, 1289843872746], // or null
      "privacy": "public",
      "allowedList": null,
      "createdAt": "2025-10-24T12:30:00Z",
      "updatedAt": "2025-10-24T12:30:00Z"
    },
    {
      "postId": 128984387246922,
      "authorId": 128984387246925,
      "authorNickname": "charlie_dev",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Private note only visible to followers.",
      "mediaIds": [1289843872746],
      "privacy": "restricted",
      "allowedList": [128984387246925, 128984387246925], // or null if the privacy not restricted
      "createdAt": "2025-10-23T17:05:00Z",
      "updatedAt": "2025-10-23T17:05:00Z"
    }
  ]

```

---

### POST `/api/v1/posts/:post_id/comments` => add comment

***status code in success: 200***

- request

```json
{
  "content": "Great post! Learned a lot.",
  "mediaIds": [1289843874657, 1289843872746]   // optional, array of uploaded media IDs
}
```

- response payload

``` json
{
  "message": "Comment added successfully.",
  "commentId": 34567865443567,
  "postId": 6754524645542645,
  "authorId": 654657658768678764,
  "content": "Great post! Learned a lot.",
  "mediaIds": [1289843874657, 1289843872746],
  "createdAt": "2025-10-24T20:45:00Z",
  "updatedAt": "2025-10-24T20:45:00Z"
}

```

---

### GET `/api/v1/posts/:post_id/comments` => list comments

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- request

```json
No need for a request body.
```

- response payload

``` json
 [
    {
      "commentId": 43765876897987,
      "authorId": 787598687987987,
      "authorNickname": "devops_mehdi",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Great post! Learned a lot.",
      "mediaIds": [23456789876567],
      "createdAt": "2025-10-24T20:45:00Z",
      "updatedAt": "2025-10-24T20:45:00Z"
    },
    {
      "commentId": 879875987698998,
      "authorId": 787989968686,
      "authorNickname": "charlie_dev",
      "authorlastName": "alice",
      "authorFirstName": "khalifa",
      "content": "Thanks for sharing!",
      "mediaIds": null,
      "createdAt": "2025-10-24T21:10:00Z",
      "updatedAt": "2025-10-24T21:10:00Z"
    }
  ]

```

---

### DELETE `/api/v1/comments/:comment_id` => delete own comment

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Comment deleted successfully."
}
```

---

### POST `/api/v1/posts/:post_id/like` => like post

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Post liked successfully.",
  "postId": 101,
  "userId": 42,
  "reaction": "like",
  "createdAt": "2025-10-24T21:30:00Z"
}
```

---

### DELETE `/api/v1/posts/:post_id/like` => remove like

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Like removed successfully.",
  "postId": 101,
  "userId": 42
}
```

---

<!-- ### POST `/api/v1/posts/:post_id/share` => share/repost

***status code in success: 200***

- request

```json
{
  "content": "Check out this post!",
  "privacy": "public"
}

```

- response payload

``` json
{
  "message": "Post shared successfully.",
  "originalPostId": 101,
  "sharedPostId": 202,
  "authorId": 42,
  "content": "Check out this post!",
  "privacy": "public",
  "createdAt": "2025-10-24T22:00:00Z"
}
```

--- -->

## 🔴 Media

### POST `/api/v1/media/upload` => upload image/GIF (returns media_id)

***status code in success: 201***

- request

```json
{
  "fileName": "avatar.png",
  "fileType": "image/png",
  "fileData": "base64-encoded-file-data",
  "Purpose":  "avatar" // avatar/post/message/comment
}

```

- response payload

``` json
{
  "message": "Media uploaded successfully.",
  "mediaId": 4576543456789,
  "mediaPath": "/media/uploads/4576543456789_avatar.png",
  "fileType": "image/png",
  "uploadedAt": "2025-10-24T22:30:00Z"
}
```

---

### GET `/api/v1/media/:media_id` => serve media file

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
🚩 todo

```

---

### DELETE `/api/v1/media/:media_id` => delete own media

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Media deleted successfully.",
  "mediaId": 4567890985745
}

```

---

## 🔴 Groups

### POST `/api/v1/groups` => create group

***status code in success: 200***

- request

```json
{
  "title": "Go Developers",
  "description": "A group for sharing Go programming tips and projects.",
  "avatarId": 657543234567865 // optinal
}

```

- response payload

``` json
{
  "message": "Group created successfully.",
  "groupId": 865435678765435,
  "creatorId": 456789087654678,
  "title": "Go Developers",
  "description": "A group for sharing Go programming tips and projects.",
  "avatarId": 657543234567865, // optinal
  "createdAt": "2025-10-24T23:15:00Z",
  "updatedAt": "2025-10-24T23:15:00Z"
}


```

---

### GET `/api/v1/groups/:group_id` => get group info

***status code in success: 200***

- response payload

``` json
{
  "groupId": 34567897656789,
  "creatorId": 45678987654678,
  "title": "Go Developers",
  "description": "A group for sharing Go programming tips and projects.",
  "memberCount": 25,
  "avatarId": 657543234567865, // optinal
  "createdAt": "2025-10-24T23:15:00Z",
  "updatedAt": "2025-10-24T23:15:00Z"
}

```

---

### PATCH `/api/v1/groups/:group_id` => update group (owner/moderator)

***status code in success: 200***

- request

```json
{
  "title": "Advanced Go Developers", // optinal
  "description": "A group for advanced Go programming discussions and projects.", // optinal
  "avatarId": 657543234567865 // optinal

}
```

- response payload

``` json
{
  "message": "Group updated successfully.",
  "groupId": 324567865435678,
  "title": "Advanced Go Developers",
  "description": "A group for advanced Go programming discussions and projects.",
  "avatarId": 657543234567865, // optinal
  "updatedAt": "2025-10-25T00:30:00Z"
}

```

---

### DELETE `/api/v1/groups/:group_id` => delete group (owner)

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Group deleted successfully.",
  "groupId": 456789087657890
}

```

---

### GET `/api/v1/groups` => browse/search groups

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- request

```json
No need for a request body.
```

- response payload

``` json
 [
    {
      "groupId": 345678908765,
      "title": "Go Developers",
      "description": "A group for sharing Go programming tips and projects.",
      "avatarId": 657543234567865, // optinal
      "creatorId": 567890987654,
      "memberCount": 456789098765,
      "createdAt": "2025-10-24T23:15:00Z"
    },
    {
      "groupId": 6574876987567647,
      "title": "Advanced Go",
      "description": "Advanced topics and projects in Go.",
      "avatarId": 657543234567865, // optinal
      "creatorId": 766587689658658,
      "memberCount": 76876876846876,
      "createdAt": "2025-10-24T23:45:00Z"
    }
  ]

```

---

### POST `/api/v1/groups/:group_id/invite/:user_id` => invite user to group

***status code in success: 201***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "User invited to group successfully.",
  "groupId": 56757876867876,
  "invitedUserId": 76876980547648,
  "status": "pending",
  "createdAt": "2025-10-25T10:12:00Z"
}

```

---

### POST `/api/v1/groups/:group_id/join` => request to join group

***status code in success: 201***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Join request submitted.",
  "groupId": 7686786787567678,
  "status": "pending"
}

```

---

### POST `/api/v1/groups/:group_id/members/:user_id/accept` => accept join/invite (owner/moderator)

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "User has been added to the group.",
  "groupId": 658745768769784676,
  "userId": 78768979585799966,
  "status": "accepted",
  "role": "member"
}

```

---

### POST `/api/v1/groups/:group_id/members/:user_id/decline` => decline

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Group join request declined.",
  "groupId": 787684563876876666,
  "userId": 678674687686777777,
  "status": "declined"
}

```

---

### GET `/api/v1/groups/:group_id/members` => list members

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - example of use: GET /api/v1/groups/:group_id/members?page=2&limit
> - Note⚠️: check the limit before using it.

- request

```json
No need for a request body.
```

- response payload

``` json

  [
    {
      "userId": 57687684648746,
      "UserNickname": "charlie_dev",
      "UserlastName": "alice",
      "role": "member",
      "joinedAt": "2025-10-24T13:40:00Z"
    }
  ]

```

---

## 🔴 Group Events

### POST `/api/v1/groups/:group_id/events` => create event

***status code in success: 201***

- request

```json
{
  "title": "Weekly Study Meetup",
  "description": "Discussion about system design topics.",
  "startAt": "2025-11-02T18:00:00Z",
  "endAt": "2025-11-02T20:00:00Z",
  "location": "Group voice room"
}
```

- response payload

``` json
{
  "eventId": 65765764678564,
  "groupId": 65768886543363,
  "title": "Weekly Study Meetup",
  "description": "Discussion about system design topics.",
  "startAt": "2025-11-02T18:00:00Z",
  "endAt": "2025-11-02T20:00:00Z",
  "location": "Group voice room",
  "createdBy": 67373777367373,
  "createdAt": "2025-10-26T12:33:10Z"
}

```

---

### GET `/api/v1/groups/:group_id/events` => list events

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json
  [
    {
      "eventId": 7635676576587654,
      "title": "Weekly Study Meetup",
      "description": "Discussion about system design topics.",
      "startAt": "2025-11-02T18:00:00Z",
      "endAt": "2025-11-02T20:00:00Z",
      "location": "Group voice room",
      "createdBy": 674657536765756,
      "createdAt": "2025-10-26T12:33:10Z"
    },
    {
      "eventId": 35673657657653,
      "title": "Reading Club",
      "description": "Chapter 3 & 4 deep dive.",
      "startAt": "2025-11-05T18:00:00Z",
      "endAt": "2025-11-05T19:30:00Z",
      "location": "Discord stage",
      "createdAy": 657567835675673,
      "createdAt": "2025-10-27T10:20:11Z"
    }
  ]


```

---

### GET `/api/v1/events/:event_id` => get event

***status code in success: 200***

- response payload

``` json
{
  "eventId": 76763576576577777,
  "groupId": 56756373567373567,
  "title": "Weekly Study Meetup",
  "description": "Discussion about system design topics.",
  "startAt": "2025-11-02T18:00:00Z",
  "endAt": "2025-11-02T20:00:00Z",
  "location": "Group voice room",
  "createdBy": {
    "userId": 6537657373737665,
    "username": "sam_dev"
  },
  "createdAt": "2025-10-26T12:33:10Z"
}

```

---

### POST `/api/v1/events/:event_id/rsvp` => RSVP (payload: option e.g., going/not_going)

***status code in success: 200***

- request

```json
{
  "option": "going"
}
```

- response payload

``` json
{
  "message": "RSVP updated successfully."
}
```

---

## 🔴 Chats & Real-time

### WS `/ws` => WebSocket endpoint for private & group real-time messaging (auth via cookie/handshake)

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json

```

---

### GET `/api/v1/chats` => list conversations

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|last-conversation-d| integer| the last conversations id default 0|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json
  [
    {
      "chatId": 5654635465465,
      "groupId": 2345678765456, // can be null
      "name": "John Doe",
      "lastMessage": {
        "id": 654645645564,
        "text": "See you tomorrow!",
        "createdAt": "2025-10-26T12:45:00Z"
      },
      "unreadCount": 2,
      "updatedAt": "2025-10-26T12:45:00Z"
    },
    {
      "chatId": 5654654765756,
      "groupId": 8765456787656, // can be null
      "name": "DevOps Study Group",
      "lastMessage": {
        "id": 456546456456,
        "text": "Server deployment successful.",
        "createdAt": "2025-10-26T09:32:10Z"
      },
      "unreadCount": 0,
      "updatedAt": "2025-10-26T09:32:10Z"
    }
  ]


```

---

### GET `/api/v1/chats/:chat_id/messages` => fetch paginated history

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|last-message-id| integer| the last conversations id default 0|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json
 [
    {
      "messageId": 564645654645,
      "senderId": 456546456546,
      "text": "See you tomorrow!",
      "createdAt": "2025-10-26T12:45:00Z"
    },
    {
      "messageId": 6546567365454,
      "senderId": 6456546455644,
      "text": "Okay cool.",
      "createdAt": "2025-10-26T12:44:10Z"
    }
  ]


```

---

### POST `/api/v1/chats/:chat_id/messages` => send message (REST fallback)

***status code in success: 200***

- request

```json
{
  "text": "Hello, how are you?"
}
```

- response payload

``` json
{
  "messageId": 6345476657563765,
  "chatId": 454576457457457,
  "senderId": 754574574574574,
  "text": "Hello, how are you?",
  "createdAt": "2025-10-26T13:15:22Z"
}

```

---

### DELETE `/api/v1/chats/:chat_id/messages/:msg_id` => delete own message

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Message deleted successfully."
}
```

### GET `/api/v1/chats/:chat_id/participants` => list participants

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
  [
    {
      "userId": 5464574574545,
      "username": "alice_dev",
      "role": "owner",
      "lastSeenMessageId": 457645674566546,
      "unreadCount": 0
    },
    {
      "userId": 456745645645745,
      "username": "bob_ops",
      "role": "member",
      "lastSeenMessageId": 4574576457474744,
      "unreadCount": 2
    }
  ]


```

---

## 🔴 Notifications

### GET `/api/v1/notifications` => list notifications (paginated)

***pagination***

> - example of use: GET /api/v1/notifications?page=2&limit=10&read=unread

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|
|read| string| Optional filter: read / unread|
|type| string| Optional filter: follow_request, post_liked, etc.|

***status code in success: 200***

- response payload

``` json
 [
    {
      "notificationId": 457547457457457,
      "type": "follow_request",
      "referenceId": 4745745547568565,
      "content": "Alice has sent you a follow request.",
      "read": "unread",
      "createdAt": "2025-10-26T12:55:00Z"
    },
    {
      "notificationId": 4324278547856,
      "type": "post_liked",
      "referenceId": 452657356573661,
      "content": "Bob liked your post.",
      "read": "read",
      "createdAt": "2025-10-26T11:45:00Z"
    }
  ]


```

---

### POST `/api/v1/notifications/:id/mark-read` => mark single notification read

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "Notification marked as read."
}

```

---

### POST `/api/v1/notifications/mark-all-read` => mark all read

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "message": "All notifications marked as read."
}
```

---

### GET `/api/v1/notifications/unread-count` => unread count

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "unreadCount": 5
}

```

---

## 🔴 Search

### GET `/api/v1/search?q=&type=users|groups|posts` => global search

***status code in success: 200***

|Parameter| Type| Description|
|----------|-------|--------------|
|page| integer| Page number (default = 1)|
|limit| integer| Number of items per page (default = 20)|

> - Note⚠️: check the limit before using it.

- response payload

``` json
 [
    {
      "id": 4657634346334,
      "username": "alice_dev",
      "firstName": "Alice",
      "lastName": "Smith",
      "avatarId": 32456788986756444
    },
    {
      "id": 43646547547547456,
      "username": "bob_ops",
      "firstName": "Bob",
      "lastName": "Johnson",
      "avatarId": 32456788986756446
    }
  ]

```

---
