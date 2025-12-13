'use client'
import { useState } from 'react'
import { UpdatePost } from '@/components/ui/UpdatePost/UpdatePost'
import { ConfirmDelete } from '@/components/ui/ConfirmDelete/ConfirmDelete'
import { http } from '@/libs/apiFetch'
import styles from './styles.module.css'

interface PostMenuProps {
  postId: number
  content: string
  privacy: string
  mediaIds?: number[]
}

export function PostMenu({ postId, content, privacy, mediaIds }: PostMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className={styles.menuContainer}>
      <button className={styles.menuButton} onClick={() => setShowMenu(!showMenu)}>
        ⋮
      </button>
      {showMenu && (
        <>
          <div className={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
          <div className={styles.menuDropdown}>
            <button onClick={() => { setShowUpdateModal(true); setShowMenu(false); }}>
              Edit Post
            </button>
            <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}>
              Delete Post
            </button>
          </div>
        </>
      )}

      {showUpdateModal && (
        <UpdatePost
          postId={postId}
          initialContent={content}
          initialPrivacy={privacy}
          initialMediaIds={mediaIds || []}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={() => window.location.reload()}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDelete
          onConfirm={async () => {
            await http.delete(`/api/v1/posts/${postId}`);
            window.location.reload();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
