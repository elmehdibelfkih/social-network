package media

const (
	QUERY_CREATE_MEDIA = `
		INSERT INTO media (id, owner_id, path, mime, purpose, created_at)
		VALUES (?, ?, ?, ?, ?, ?);
	`

	QUERY_GET_MEDIA = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE id = ?;
	`

	QUERY_DELETE_MEDIA = `
		DELETE FROM media
		WHERE id = ? AND owner_id = ?;
	`

	QUERY_GET_MEDIA_BY_USER = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE owner_id = ?
		ORDER BY created_at DESC;
	`

	QUERY_GET_MEDIA_BY_USER_AND_PURPOSE = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE owner_id = ? AND purpose = ?
		ORDER BY created_at DESC;
	`

	QUERY_GET_MEDIA_BATCH_BY_USER = `
		SELECT id, owner_id, path, mime, purpose
		FROM media
		WHERE owner_id = ? AND id IN (?, ?, ?);
	`

	QUERY_UPDATE_MEDIA_PURPOSE = `
		UPDATE media
		SET purpose = ?
		WHERE id = ? AND owner_id = ?;
	`

	QUERY_CHECK_MEDIA_OWNERSHIP = `
		SELECT COUNT(1)
		FROM media
		WHERE id = ? AND owner_id = ?;
	`
)
