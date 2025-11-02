package media

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
	queryGetMediaByUser = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE owner_id = ?
		ORDER BY created_at DESC;
	`

	queryGetMediaByUserAndPurpose = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE owner_id = ? AND purpose = ?
		ORDER BY created_at DESC;
	`

	queryGetMediaBatchByUser = `
		SELECT id, owner_id, path, mime, purpose
		FROM media
		WHERE owner_id = ? AND id IN (?, ?, ?);
	`
	queryUpdateMediaPurpose = `
		UPDATE media
		SET purpose = ?
		WHERE id = ? AND owner_id = ?;
	`

	queryCheckMediaOwnership = `
		SELECT COUNT(1)
		FROM media
		WHERE id = ? AND owner_id = ?;
	`
)
