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
  "dateOfBirth": "01/01/2001",
  "nickname": "nickname",
  "aboutMe": "present who you are and what you do.",
  "avatarId": 23456754324567, 
}
```

- response payload

``` json
{
  "userId": 1289843874339,
  "email": "email@example.com",
  "firstName": "first",
  "lastName": "last",
  "dateOfBirth": "01/01/2001",
  "nickname": "nickname", // optinal
  "aboutMe": "present who you are and what you do.", // optinal
  "avatarId": 23456754324567, // optinal 
}
```

> - Note⚠️: nickname/email/userId must be unique

---

### POST `/api/v1/auth/login` => create session (sets HttpOnly session cookie)

***status code in success: 200***

- request

```json
{
  "email/userId/nickname": "email@example.com/1289843874339/nickname",
  "password": "Pa$$w0rd!",
}
```

- response payload

``` json
{
  "userId": 1289843874339,
  "email": "email@example.com",
  "firstName": "first",
  "lastName": "last",
  "dateOfBirth": "01/01/2001",
  "nickname": "nickname",
  "aboutMe": "present who you are and what you do.",
  "avatarId": 23456754324567,
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
{
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
}

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
  "status": "follow", // follow/unfollow
  "nickname": "nickname", // or null
  "firstName": "first",
  "lastName": "last",
  "avatarId": 1289843874780,
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

### PUT `/api/v1/users/:user_id/profile` => update own profile

***status code in success: 200***

- request

```json
{
  "firstName": "first",
  "lastName": "last",
  "nickname": "nickname",
  "aboutMe": "Cloud and DevOps engineer passionate about scalable systems.",
  "avatarId": 1289843874780,
  "dateOfBirth": "2001-01-01",
  "email": "email@example.com",
}
```

- response payload

``` json
{
  "message": "Updated successful.",
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

<!-- ### GET `/api/v1/users/:user_id/activity` => user activity summary -->

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
  "followerUserId": 1289843874336,
  "createdAt": "2025-10-24T18:20:00Z"
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
  "message": "You have unfollowed this user.",
  "targetUserId": 1289843874339,
  "followerUserId": 1289843874336,
  "unfollowedAt": "2025-10-24T18:25:00Z"
}
```

---

### GET `/api/v1/users/:user_id/followers` => list followers

***status code in success: 200***

- response payload

``` json
{
  "userId": 1289843874339,
  "followers": [
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
}

```

---

### GET `/api/v1/users/:user_id/following` => list followees

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "userId": 1289843874339,
  "following": [
    {
      "userId": 1289843874323,
      "nickname": "alice123",
      "firstName": "Alice",
      "lastName": "Johnson",
      "avatarPath": "/media/avatars/1289843874323.png",
      "followedAt": "2025-10-10T12:00:00Z",
      "status": "accepted" // pending/accepted/declined
    },
    {
      "userId": 1289843874334,
      "nickname": "bob_dev",
      "firstName": "Bob",
      "lastName": "Smith",
      "avatarPath": "/media/avatars/1289843874334.png",
      "followedAt": "2025-10-12T15:30:00Z",
      "status": "accepted" // pending/accepted/declined
    }
  ]
}
```

---

### GET `/api/v1/follow-requests` => list received follow requests for current user

***status code in success: 200***

- response payload

``` json
{
  "userId": 1289843874339,
  "followRequests": [
    {
      "followerId": 6249843274333,
      "nickname": "alice123",
      "firstName": "Alice",
      "lastName": "Johnson",
      "avatarPath": "/media/avatars/6249843274333.png",
      "requestedAt": "2025-10-20T14:30:00Z",
      "status": "pending"
    },
    {
      "followerId": 3489443834339,
      "nickname": "bob_dev",
      "firstName": "Bob",
      "lastName": "Smith",
      "avatarPath": "/media/avatars/3489443834339.png",
      "requestedAt": "2025-10-21T10:15:00Z",
      "status": "pending"
    }
  ]
}
```

---

### POST `/api/v1/follow-requests/:user_id/accept` => accept request // todo

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
  "acceptedAt": "2025-10-24T18:50:00Z"
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
  "declinedAt": "2025-10-24T18:55:00Z"
}
```

---

## 🔴 Feed

### GET `GET /api/v1/feed?page=1&limit=20` => paginated personal feed (public + followees + groups + allowed private)

***status code in success: 200***

- response payload

``` json
{
  "userId": 1289843874339,
  "page": 1,
  "limit": 20,
  "totalPosts": 135,
  "posts": [
    {
      "postId": 3389843874075,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "content": "Deploying a new Go microservice!",
      "mediaIds": [23456543456787654],
      "privacy": "followers",
      "createdAt": "2025-10-24T15:00:00Z",
      "updatedAt": "2025-10-24T15:00:00Z",
      "groupId": null
    },
    {
      "postId": 8689843874069,
      "authorId": 1289843874339,
      "authorNickname": "diana_ops",
      "content": "Cloud architecture tips.",
      "mediaIds": [],
      "privacy": "public",
      "createdAt": "2025-10-23T18:20:00Z",
      "updatedAt": "2025-10-23T18:20:00Z",
      "groupId": null
    }
  ]
}
```

---

### GET `/api/v1/users/:user_id/feed?page=1&limit=20` => view specific user’s visible posts (respect privacy)

***status code in success: 200***

- response payload

``` json
{
  "userId": 1289843874339,
  "page": 1,
  "limit": 20,
  "totalPosts": 48,
  "posts": [
    {
      "postId": 1289843874332,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "content": "Working on a new distributed system...",
      "mediaIds": [],
      "privacy": "public",
      "createdAt": "2025-10-24T12:30:00Z",
      "updatedAt": "2025-10-24T12:30:00Z"
    },
    {
      "postId": 1289843874658,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "content": "Private note only visible to followers.",
      "mediaIds": [],
      "privacy": "followers",
      "createdAt": "2025-10-23T17:05:00Z",
      "updatedAt": "2025-10-23T17:05:00Z"
    }
  ]
}
```

---

### GET `/api/v1/groups/:group_id/feed?page=1&limit=20` => group feed (members only)

***status code in success: 200***

- response payload

``` json
{
  "groupId": 1289843874339,
  "page": 1,
  "limit": 20,
  "totalPosts": 37,
  "posts": [
    {
      "postId": 1289843874332,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "content": "Working on a new distributed system...",
      "mediaPaths": ["/media/posts/321_1.jpg"],
      "privacy": "public",
      "createdAt": "2025-10-24T12:30:00Z",
      "updatedAt": "2025-10-24T12:30:00Z"
    },
    {
      "postId": 1289843874658,
      "authorId": 1289843874339,
      "authorNickname": "charlie_dev",
      "content": "Private note only visible to followers.",
      "mediaPaths": [],
      "privacy": "followers",
      "createdAt": "2025-10-23T17:05:00Z",
      "updatedAt": "2025-10-23T17:05:00Z"
    }
  ]
}
```

---

<!-- 

***status code in success: 200***

- request

```json
{

}
```

- response payload

``` json
{

}
```

---

-->

## 🔴 Posts / Comments / Reactions

### POST `/api/v1/posts` => create post (body: content, privacy, allowed_list, group_id, media_ids)

***status code in success: 201***

- request

```json
{
  "content": "Hello world — launching my new service today!",
  "privacy": "public",
  "allowedList": [1289843874658, 1289843874658],
  "groupId": null,
  "mediaIds": [1289843874657, 1289843872746]
}
```

- response payload

``` json
{
  "message": "Post created successfully.",
  "postId": 128984387246925,
  "authorId": 1289843892780,
  "privacy": "public",
  "groupId": null,
  "mediaIds": [1289843874657, 1289843872746],
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
  "authorNickname": "devops_mehdi",
  "content": "Hello world — launching my new service today!",
  "mediaIds": [1289843874657, 1289843872746],
  "privacy": "public",
  "groupId": null,
  "allowedList": [],
  "createdAt": "2025-10-24T19:30:00Z",
  "updatedAt": "2025-10-24T19:30:00Z"
}

```

---

### PUT `/api/v1/posts/:post_id` => update own post

***status code in success: 200***

- request

```json
{
  "content": "Updated post content here...",
  "privacy": "followers",
  "allowedList": [128984387246925, 128984387246925],
  "mediaIds": [1289843874657, 1289843872746],
}
```

- response payload

``` json
{
  "message": "Post updated successfully.",
  "post": {
    "postId": 128984387246925,
    "authorId": 128984387246925,
    "content": "Updated post content here...",
    "mediaIds": [1289843874657, 1289843872746],
    "privacy": "followers",
    "allowedList": [128984387246925, 128984387246925],
    "groupId": null,
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

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "userId": 128984387246925,
  "page": 1,
  "limit": 20,
  "totalPosts": 48,
  "posts": [
    {
      "postId": 128984387246923,
      "authorId": 128984387246925,
      "authorNickname": "charlie_dev",
      "content": "Working on a new distributed system...",
      "mediaIds": [1289843874657, 1289843872746],
      "privacy": "public",
      "createdAt": "2025-10-24T12:30:00Z",
      "updatedAt": "2025-10-24T12:30:00Z"
    },
    {
      "postId": 128984387246922,
      "authorId": 128984387246925,
      "authorNickname": "charlie_dev",
      "content": "Private note only visible to followers.",
      "mediaIds": [1289843872746],
      "privacy": "followers",
      "createdAt": "2025-10-23T17:05:00Z",
      "updatedAt": "2025-10-23T17:05:00Z"
    }
  ]
}
```

---

### POST `/api/v1/posts/:post_id/comments` => add comment

***status code in success: 200***

- request

```json
{
  "content": "Great post! Learned a lot.",
  "mediaIds": [901, 902]   // optional, array of uploaded media IDs
}
```

- response payload

``` json
{
  "message": "Comment added successfully.",
  "commentId": 501,
  "postId": 101,
  "authorId": 42,
  "content": "Great post! Learned a lot.",
  "mediaIds": [1289843874657, 1289843872746],
  "createdAt": "2025-10-24T20:45:00Z",
  "updatedAt": "2025-10-24T20:45:00Z"
}

```

---

### GET `/api/v1/posts/:post_id/comments` => list comments

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "postId": 101,
  "page": 1,
  "limit": 20,
  "totalComments": 12,
  "comments": [
    {
      "commentId": 501,
      "authorId": 42,
      "authorNickname": "devops_mehdi",
      "content": "Great post! Learned a lot.",
      "mediaPaths": ["/media/comments/501_1.png"],
      "createdAt": "2025-10-24T20:45:00Z",
      "updatedAt": "2025-10-24T20:45:00Z"
    },
    {
      "commentId": 502,
      "authorId": 55,
      "authorNickname": "charlie_dev",
      "content": "Thanks for sharing!",
      "mediaPaths": [],
      "createdAt": "2025-10-24T21:10:00Z",
      "updatedAt": "2025-10-24T21:10:00Z"
    }
  ]
}
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

<!-- ### POST `/api/v1/posts/:post_id/share` => share/repost todo: later

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
  "fileData": "base64-encoded-file-data"
}

```

- response payload

``` json
{
  "message": "Media uploaded successfully.",
  "mediaId": 789,
  "mediaPath": "/media/uploads/789_avatar.png",
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
  "mediaId": 789
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
  "groupId": 101,
  "creatorId": 42,
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

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "groupId": 101,
  "creatorId": 42,
  "title": "Go Developers",
  "description": "A group for sharing Go programming tips and projects.",
  "memberCount": 25,
  "avatarId": 657543234567865, // optinal
  "createdAt": "2025-10-24T23:15:00Z",
  "updatedAt": "2025-10-24T23:15:00Z"
}

```

---

### PUT `/api/v1/groups/:group_id` => update group (owner/moderator)

***status code in success: 200***

- request

```json
{
  "title": "Advanced Go Developers",
  "description": "A group for advanced Go programming discussions and projects.",
  "avatarId": 657543234567865 // optinal

}
```

- response payload

``` json
{
  "message": "Group updated successfully.",
  "groupId": 101,
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
  "groupId": 101
}

```

---

### GET `/api/v1/groups` => browse/search groups

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "limit": 20,
  "totalGroups": 48,
  "groups": [
    {
      "groupId": 101,
      "title": "Go Developers",
      "description": "A group for sharing Go programming tips and projects.",
      "avatarId": 657543234567865, // optinal
      "creatorId": 42,
      "memberCount": 25,
      "createdAt": "2025-10-24T23:15:00Z"
    },
    {
      "groupId": 102,
      "title": "Advanced Go",
      "description": "Advanced topics and projects in Go.",
      "avatarId": 657543234567865, // optinal
      "creatorId": 55,
      "memberCount": 12,
      "createdAt": "2025-10-24T23:45:00Z"
    }
  ]
}

```

---

### POST `/api/v1/groups/:group_id/invite` => invite user to group

***status code in success: 201***

- request

```json
{
  "userId": 55
}
```

- response payload

``` json
{
  "message": "User invited to group successfully.",
  "groupId": 101,
  "invitedUserId": 55,
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
  "groupId": 101,
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
  "groupId": 101,
  "userId": 55,
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
  "groupId": 101,
  "userId": 55,
  "status": "declined"
}

```

---

### GET `/api/v1/groups/:group_id/members` => list members

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "group_id": 12,
  "members": [
    {
      "user_id": 101,
      "full_name": "Example User",
      "role": "member",
      "joined_at": "2025-10-24T13:40:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 135
  }
}
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
  "start_at": "2025-11-02T18:00:00Z",
  "end_at": "2025-11-02T20:00:00Z",
  "location": "Group voice room"
}
```

- response payload

``` json
{
  "event_id": 987,
  "group_id": 45,
  "title": "Weekly Study Meetup",
  "description": "Discussion about system design topics.",
  "start_at": "2025-11-02T18:00:00Z",
  "end_at": "2025-11-02T20:00:00Z",
  "location": "Group voice room",
  "created_by": 123,
  "created_at": "2025-10-26T12:33:10Z"
}

```

---

### GET `/api/v1/groups/:group_id/events` => list events

***status code in success: 200***

- response payload

``` json
{
  "group_id": 45,
  "events": [
    {
      "event_id": 987,
      "title": "Weekly Study Meetup",
      "description": "Discussion about system design topics.",
      "start_at": "2025-11-02T18:00:00Z",
      "end_at": "2025-11-02T20:00:00Z",
      "location": "Group voice room",
      "created_by": 123,
      "created_at": "2025-10-26T12:33:10Z"
    },
    {
      "event_id": 988,
      "title": "Reading Club",
      "description": "Chapter 3 & 4 deep dive.",
      "start_at": "2025-11-05T18:00:00Z",
      "end_at": "2025-11-05T19:30:00Z",
      "location": "Discord stage",
      "created_by": 123,
      "created_at": "2025-10-27T10:20:11Z"
    }
  ]
}

```

---

### GET `/api/v1/events/:event_id` => get event

***status code in success: 200***

- response payload

``` json
{
  "event_id": 987,
  "group_id": 45,
  "title": "Weekly Study Meetup",
  "description": "Discussion about system design topics.",
  "start_at": "2025-11-02T18:00:00Z",
  "end_at": "2025-11-02T20:00:00Z",
  "location": "Group voice room",
  "created_by": {
    "user_id": 123,
    "username": "sam_dev"
  },
  "created_at": "2025-10-26T12:33:10Z"
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

- response payload

``` json
{
  "chats": [
    {
      "chatId": 789,
      "groupId": 2345678765456, // can be null
      "name": "John Doe",
      "lastMessage": {
        "id": 4521,
        "text": "See you tomorrow!",
        "createdAt": "2025-10-26T12:45:00Z"
      },
      "unreadCount": 2,
      "updatedAt": "2025-10-26T12:45:00Z"
    },
    {
      "chatId": 101,
      "groupId": 8765456787656, // can be null
      "name": "DevOps Study Group",
      "lastMessage": {
        "id": 9981,
        "text": "Server deployment successful.",
        "createdAt": "2025-10-26T09:32:10Z"
      },
      "unreadCount": 0,
      "updatedAt": "2025-10-26T09:32:10Z"
    }
  ]
}

```

---

### GET `/api/v1/chats/:chat_id/messages` => fetch paginated history

***status code in success: 200***

- response payload

``` json
{
  "chatId": 789,
  "page": 1,
  "limit": 20,
  "messages": [
    {
      "messageId": 4521,
      "senderId": 123,
      "text": "See you tomorrow!",
      "createdAt": "2025-10-26T12:45:00Z"
    },
    {
      "messageId": 4520,
      "senderId": 456,
      "text": "Okay cool.",
      "createdAt": "2025-10-26T12:44:10Z"
    }
  ]
}

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
  "messageId": 9921,
  "chatId": 789,
  "senderId": 123,
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

---

### GET `/api/v1/chats/:chat_id/participants` => list participants

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "chatId": 789,
  "participants": [
    {
      "userId": 123,
      "username": "alice_dev",
      "role": "owner",
      "lastSeenMessageId": 4521,
      "unreadCount": 0
    },
    {
      "userId": 456,
      "username": "bob_ops",
      "role": "member",
      "lastSeenMessageId": 4519,
      "unreadCount": 2
    }
  ]
}

```

---

## 🔴 Notifications

### GET `/api/v1/notifications` => list notifications (paginated)

***status code in success: 200***

- request

```json
No need for a request body.
```

- response payload

``` json
{
  "page": 1,
  "limit": 20,
  "notifications": [
    {
      "notificationId": 987,
      "type": "follow_request",
      "referenceId": 123,
      "content": "Alice has sent you a follow request.",
      "read": "unread",
      "createdAt": "2025-10-26T12:55:00Z"
    },
    {
      "notificationId": 988,
      "type": "post_liked",
      "referenceId": 4521,
      "content": "Bob liked your post.",
      "read": "read",
      "createdAt": "2025-10-26T11:45:00Z"
    }
  ]
}

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

- response payload

``` json
{
  "query": "keyword",
  "type": "users",
  "results": [
    {
      "id": 123,
      "username": "alice_dev",
      "firstName": "Alice",
      "lastName": "Smith",
      "avatarPath": "/media/avatars/1289843874339.png"
    },
    {
      "id": 456,
      "username": "bob_ops",
      "firstName": "Bob",
      "lastName": "Johnson",
      "avatarPath": "/media/avatars/1289843874340.png"
    }
  ]
}

```

---
