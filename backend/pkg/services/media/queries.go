package auth

const (
	queryCreateMedia = `
		INSERT INTO media (id, owner_id, path, mime, purpose, created_at)
		VALUES (?, ?, ?, ?, ?, ?);
	`

	queryGetMedia = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE id = ?
	`

	queryDeleteMedia = `
		DELETE FROM media
		WHERE id = ? AND owner_id = ?
	`
)
