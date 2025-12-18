'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './UpdatePost.module.css'
import { http, fetchMediaClient } from '@/libs/apiFetch'
import { GlobeIcon, DropdownIcon, LockIcon, UsersIcon, ImageIcon } from '@/components/ui/icons'
import AddFriends from '@/components/ui/AddFriends/addFriends'

const privacyOptions = [
  { value: 'public', label: 'Public', description: 'Anyone can see this post', icon: 'globe' },
  { value: 'followers', label: 'Followers', description: 'Only your followers can see', icon: 'users' },
  { value: 'private', label: 'Private', description: 'Only you can see', icon: 'lock' },
  { value: 'restricted', label: 'Restricted', description: 'Only share with...', icon: 'users' }
] as const

interface UpdatePostProps {
  postId: number
  initialContent: string
  initialPrivacy: string
  initialMediaIds?: number[]
  onClose: () => void
  onUpdate: (updatedPost: any) => void
}

export function UpdatePost({ postId, initialContent, initialPrivacy, initialMediaIds, onClose, onUpdate }: UpdatePostProps) {
  const [content, setContent] = useState(initialContent)
  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [mediaIds, setMediaIds] = useState<number[]>(initialMediaIds || [])
  const [mediaUrls, setMediaUrls] = useState<{[key: number]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false)
  const [showAddFriends, setShowAddFriends] = useState(false)
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadMediaUrls = async () => {
      const urls: {[key: number]: string} = {}
      for (const mediaId of mediaIds) {
        try {
          const media = await fetchMediaClient(String(mediaId))
          if (media?.mediaEncoded) {
            urls[mediaId] = `data:image/jpeg;base64,${media.mediaEncoded}`
          }
        } catch (error) {
          console.error('Failed to load media:', error)
        }
      }
      setMediaUrls(urls)
    }
    if (mediaIds.length > 0) {
      loadMediaUrls()
    }
  }, [mediaIds])

  const getPrivacyIcon = (icon: string) => {
    if (icon === 'globe') return <GlobeIcon fillColor="currentColor" />
    if (icon === 'users') return <UsersIcon />
    if (icon === 'lock') return <LockIcon />
  }

  const removeMedia = (mediaId: number) => {
    setMediaIds(prev => prev.filter(id => id !== mediaId))
    setMediaUrls(prev => {
      const newUrls = { ...prev }
      delete newUrls[mediaId]
      return newUrls
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalPhotos = mediaIds.length + selectedFiles.length + files.length

    if (totalPhotos > 10) {
      const remaining = 10 - (mediaIds.length + selectedFiles.length)
      if (remaining > 0) {
        setSelectedFiles(prev => [...prev, ...files.slice(0, remaining)])
        alert(`Maximum 10 photos allowed. Added ${remaining} photo(s).`)
      } else {
        alert('Maximum 10 photos allowed.')
      }
      return
    }

    setSelectedFiles(prev => [...prev, ...files])
    if (e.target) e.target.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadMedia = async (file: File): Promise<number> => {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )

    const payload = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileData: base64,
      purpose: 'post'
    }

    const response = await http.post<{mediaId: number}>('/api/v1/media/upload', payload)
    return response.mediaId
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      let newMediaIds: number[] = []
      if (selectedFiles.length > 0) {
        const uploaded = await Promise.all(selectedFiles.map(uploadMedia))
        newMediaIds = uploaded
      }

      await http.put(`/api/v1/posts/${postId}`, {
        content: content.trim(),
        privacy,
        mediaIds: [...mediaIds, ...newMediaIds],
        allowedList: privacy === 'restricted' && selectedFollowers.length ? selectedFollowers : undefined
      })
      
      onUpdate({
        postId,
        content: content.trim(),
        privacy,
        mediaIds: [...mediaIds, ...newMediaIds]
      })
      onClose()
    } catch (error) {
      console.error('Failed to update post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Update Post</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={6}
            maxLength={500}
            required
            minLength={1}
          />

          {(mediaIds.length > 0 || selectedFiles.length > 0) && (
            <div className={styles.mediaContainer}>
              {mediaIds.map(mediaId => (
                <div key={mediaId} className={styles.mediaItem}>
                  {mediaUrls[mediaId] && (
                    <img src={mediaUrls[mediaId]} alt="Post media" className={styles.mediaImage} />
                  )}
                  <button
                    type="button"
                    className={styles.removeMediaBtn}
                    onClick={() => removeMedia(mediaId)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedFiles.map((file, index) => (
                <div key={`file-${index}`} className={styles.mediaItem}>
                  <img src={URL.createObjectURL(file)} alt="New media" className={styles.mediaImage} />
                  <button
                    type="button"
                    className={styles.removeMediaBtn}
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={mediaIds.length + selectedFiles.length >= 10}
            >
              <ImageIcon />
              {mediaIds.length + selectedFiles.length > 0
                ? `${mediaIds.length + selectedFiles.length}/10 Photos`
                : 'Add Photos'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileSelect}
            />

            <div className={styles.privacyContainer}>
              <button
                type="button"
                className={styles.privacyButton}
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
              >
                {getPrivacyIcon(privacyOptions.find(p => p.value === privacy)?.icon || '')}
                {privacyOptions.find(p => p.value === privacy)?.label}
                <DropdownIcon />
              </button>

              {showPrivacyDropdown && (
                <div
                  className={styles.dropdownBackdrop}
                  onClick={() => setShowPrivacyDropdown(false)}
                >
                  <div className={styles.privacyDropdown} onClick={(e) => e.stopPropagation()}>
                    {privacyOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.privacyOption} ${privacy === opt.value ? styles.active : ''}`}
                        onClick={() => {
                          setPrivacy(opt.value)
                          setShowPrivacyDropdown(false)
                          if (opt.value === 'restricted') setShowAddFriends(true)
                        }}
                      >
                        <div className={styles.privacyOptionIcon}>
                          {getPrivacyIcon(opt.icon)}
                        </div>

                        <div className={styles.privacyOptionContent}>
                          <div className={styles.privacyOptionLabel}>{opt.label}</div>
                          <div className={styles.privacyOptionDesc}>{opt.description}</div>
                        </div>

                        {privacy === opt.value && (
                          <div className={styles.privacyOptionCheck}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {showAddFriends && (
            <div className={styles.addFriendsModal}>
              <div className={styles.addFriendsOverlay} onClick={() => setShowAddFriends(false)} />
              <div className={styles.addFriendsContent}>
                <AddFriends
                  title="Allowed followers"
                  desc="Choose who can see"
                  componentId="0"
                  purpose="post"
                  onComplete={(ids) => {
                    setSelectedFollowers(ids)
                    setShowAddFriends(false)
                  }}
                  onClose={() => setShowAddFriends(false)}
                />
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !content.trim()} className={styles.submitBtn}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
