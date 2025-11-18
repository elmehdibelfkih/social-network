# 🕸️ Social Network

A modern, lightweight **social network platform** designed for learning and prototyping.  
Built with **Go (backend)**, **Next.js (frontend)**, and **SQLite (database)** — easily extendable to PostgreSQL or MySQL.

---

## run the project

- Note⚠️: the commands must be run in the root of the project.

to run local on your machine:

```makefile
    make dev # running a development server.
    make up # up directly relates to the docker-compose up command.
    
    make stop-dev # Clearly indicates stopping the local development process.
    make down # down directly relates to the docker-compose down command, which is often preferred for a clean stop

```

## 🚀 Overview

This project provides a complete social platform stack with:

- REST API for users, posts, comments, follows, and chats
- Next.js frontend for the client interface
- SQLite for quick development and testing
- Docker setup for isolated, reproducible environments

---

## 🧩 Features

- User authentication and sessions (JWT or cookies)
- Profile pages with bio and avatar
- Posts with text and optional media
- Comments and threaded replies
- Likes / dislikes (reactions)
- Follow system with request status
- Chat system (private and group)
- Categories and tags
- Search endpoints (users / posts)
- Rate-limiting and privacy settings

---

## 📡 [API Design](./docs/api.md)

### 🔴 Auth / Sessions

- POST `/api/v1/auth/register` => create account
- POST `/api/v1/auth/login` => create session (sets HttpOnly session cookie)
- POST `/api/v1/auth/logout` => destroy current session
- GET `/api/v1/auth/session` => validate session / return current user
- GET `/api/v1/sessions` => list active sessions for current user
- DELETE `/api/v1/sessions/:session_id` => revoke specific session

### 🔴 Users / Profiles

- GET `/api/v1/users/:user_id/profile` => get public/profile view (respect privacy)
- PATCH `/api/v1/users/:user_id/profile` => update own profile
- PATCH `/api/v1/users/:user_id/privacy` => toggle public/private profile
- GET `/api/v1/users/:user_id/stats` => counts

### 🔴 Followers / Follow Requests

- POST `/api/v1/users/:user_id/follow` => send follow request or follow immediately if target is public
- POST `/api/v1/users/:user_id/unfollow` => unfollow
- GET `/api/v1/users/:user_id/followers` => list followers
- GET `/api/v1/users/:user_id/following` => list followees
- GET `/api/v1/follow-requests` => list received follow requests for current user
- POST `/api/v1/follow-requests/:user_id/accept` => accept request
- POST `/api/v1/follow-requests/:user_id/decline` => decline request

### 🔴 Feed

- GET `GET /api/v1/feed?page=1&limit=20` => paginated personal feed (public + followees + groups + allowed private)
- GET `/api/v1/users/:user_id/feed?page=1&limit=20` => view specific user’s visible posts (respect privacy)
- GET `/api/v1/groups/:group_id/feed?page=1&limit=20` => group feed (members only)

### 🔴 Posts / Comments / Reactions

- POST `/api/v1/posts` => create post (body: content, privacy, allowed_list, group_id, media_ids)
- GET `/api/v1/posts/:post_id` => get a single post (respect privacy)
- PATCH `/api/v1/posts/:post_id` => update own post
- DELETE `/api/v1/posts/:post_id` => delete own post
- GET `/api/v1/users/:user_id/posts` => list user’s posts
- POST `/api/v1/posts/:post_id/comments` => add comment
- GET `/api/v1/posts/:post_id/comments` => list comments
- DELETE `/api/v1/comments/:comment_id` => delete own comment
- POST `/api/v1/posts/:post_id/like` => like post
- DELETE `/api/v1/posts/:post_id/like` => remove like

### 🔴 Media

- POST `/api/v1/media/upload` => upload image/GIF (returns media_id)
- GET `/api/v1/media/:media_id` => serve media file
- DELETE `/api/v1/media/:media_id` => delete own media

### 🔴 Groups

- POST `/api/v1/groups` => create group
- GET `/api/v1/groups/:group_id` => get group info
- PATCH `/api/v1/groups/:group_id` => update group (owner/moderator)
- DELETE `/api/v1/groups/:group_id` => delete group (owner)
- GET `/api/v1/groups` => browse/search groups
- GET `/api/v1/groups/:user_id` => get user groups (respect pricavy)
- POST `/api/v1/groups/:group_id/invite/:user_id` => invite user to group
- POST `/api/v1/groups/:group_id/join` => request to join group
- POST `/api/v1/groups/:group_id/members/:user_id/accept` => accept join/invite (owner/moderator)
- POST `/api/v1/groups/:group_id/members/:user_id/decline` => decline
- GET `/api/v1/groups/:group_id/members` => list members

### 🔴 Group Events

- POST `/api/v1/groups/:group_id/events` => create event
- GET `/api/v1/groups/:group_id/events` => list events
- GET `/api/v1/events/:event_id` => get event
- POST `/api/v1/events/:event_id/rsvp` => RSVP (payload: option e.g., going/not_going)

### 🔴 Chats & Real-time

- WS `/ws` => WebSocket endpoint for private & group real-time messaging (auth via cookie/handshake)
- GET `/api/v1/chats` => list conversations
- GET `/api/v1/chats/:chat_id/messages` => fetch paginated history
- POST `/api/v1/chats/:chat_id/messages` => send message (REST fallback)
- DELETE `/api/v1/chats/:chat_id/messages/:msg_id` => delete own message
- GET `/api/v1/chats/:chat_id/participants` => list participants

### 🔴 Notifications

- GET `/api/v1/notifications` => list notifications (paginated)
- POST `/api/v1/notifications/:id/mark-read` => mark single notification read
- POST `/api/v1/notifications/mark-all-read` => mark all read
- GET `/api/v1/notifications/unread-count` => unread count

### 🔴 Search

- GET `/api/v1/search?q=&type=users|groups|posts` => global search

For full API details, see the [API Documentation](./docs/api.md).
