package v1

import "net/http"

func SocialMux() *http.ServeMux {
	forumux := http.NewServeMux()

	// // authontication mux
	// forumux.HandleFunc("/api/login", auth.SubmitLogin)
	// forumux.HandleFunc("/api/register", auth.SubmitRegister)
	// forumux.HandleFunc("/api/logout", auth.LogoutHandler)
	// forumux.HandleFunc("/api/loggedin", auth.CheckLoginHandler)

	// //homepage mux
	// forumux.HandleFunc("/api/", middleware.AuthMidleware(handler.RootHandler))

	// // profile mux
	// forumux.HandleFunc("/api/profile", middleware.AuthMidleware(profile.ProfilHandler))
	// forumux.HandleFunc("/api/profile/update", middleware.AuthMidleware(profile.SaveChanges))
	// forumux.HandleFunc("/api/profile/delete", middleware.AuthMidleware(profile.DeleteConfirmation))

	// // comment mux
	// forumux.HandleFunc("/api/newComment", middleware.AuthMidleware(comment.NewCommentHandler))
	// forumux.HandleFunc("/api/comment", middleware.AuthMidleware(comment.CommentHandler))

	// // post mux
	// forumux.HandleFunc("/api/newPost", middleware.AuthMidleware(post.NewPostHandler))
	// forumux.HandleFunc("/api/post", middleware.AuthMidleware(post.PostHandler))

	// // post like dislike
	// forumux.HandleFunc("/api/like", middleware.AuthMidleware(react.PostLikeHandler))
	// forumux.HandleFunc("/api/dislike", middleware.AuthMidleware(react.PostDislikeHandler))

	// // comment like dislike
	// forumux.HandleFunc("/api/commentLike", middleware.AuthMidleware(react.CommentLikeHandler))
	// forumux.HandleFunc("/api/commentDislike", middleware.AuthMidleware(react.CommentDislikeHandler))

	// //chat mux
	// forumux.HandleFunc("/api/chat", middleware.AuthMidleware(chat.HistoryHandler))

	// //ws mux
	// forumux.HandleFunc("/ws", middleware.AuthMidleware(ws.WebSocketHandler))

	// // static mux
	// forumux.HandleFunc("/", static.IndexHandler)
	// forumux.HandleFunc("/static/", static.StaticHandler)

	return forumux
}
