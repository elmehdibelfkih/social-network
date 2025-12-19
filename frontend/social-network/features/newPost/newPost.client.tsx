'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { } from '../mini_profile/styles.module.css';
import { ImageIcon, GlobeIcon, DropdownIcon, LockIcon, UsersIcon } from '@/components/ui/icons';
import AddFriends from '@/components/ui/AddFriends/addFriends';
import { postsService } from './postsService';
import type { PrivacyLevel } from './types';
import { useAuth } from '@/providers/authProvider';
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';
import { useUserStats } from '@/providers/userStatsContext';

export const privacyOptions = [
  { value: 'public', label: 'Public', description: 'Anyone can see this post', icon: 'globe' },
  { value: 'followers', label: 'Followers', description: 'Only your followers can see', icon: 'users' },
  { value: 'private', label: 'Private', description: 'Only you can see', icon: 'lock' },
  { value: 'restricted', label: 'Restricted', description: 'Only share with...', icon: 'users' }
] as const;

export function NewPostClient({ groupId }: { groupId?: number | null }) {
  const { user } = useAuth();
  const { dispatch } = useUserStats();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyLevel>(groupId ? 'group' : 'public');
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted || !user) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedFiles(Array.from(e.target.files || []).slice(0, 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      let mediaIds: number[] = [];

      if (selectedFiles.length > 0) {
        const uploaded = await Promise.all(selectedFiles.map(postsService.uploadMedia));
        mediaIds = uploaded.map(r => r.mediaId);
      }

      const newPost = await postsService.createPost({
        content: content.trim(),
        privacy,
        mediaIds: mediaIds.length ? mediaIds : undefined,
        allowedList:
          privacy === 'restricted' && selectedFollowers.length ? selectedFollowers : undefined,
        groupId: groupId || undefined 
      });

      setContent('');
      setSelectedFiles([]);
      setPrivacy(groupId ? 'group' : 'public'); 
      setSelectedFollowers([]);
      dispatch({ type: 'INCREMENT_POSTS' })
      
      const completePost = {
        ...newPost,
        authorFirstName: newPost.authorFirstName || user.firstName,
        authorLastName: newPost.authorLastName || user.lastName,
        content: newPost.content || content.trim()
      }

      window.dispatchEvent(new CustomEvent('newPost', { detail: completePost }))
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrivacyIcon = (icon: string) => {
    if (icon === 'globe') return <GlobeIcon fillColor="currentColor" />;
    if (icon === 'users') return <UsersIcon />;
    if (icon === 'lock') return <LockIcon />;
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.leftPart}>
        <AvatarHolder avatarId={user?.avatarId ?? null} size={60} />
      </div>

      <div className={styles.rightPart}>
        <div className={styles.userInfo}>
          <div className={styles.miniHandle}>{user.firstName + ' ' + user.lastName}</div>
          <h4 className={styles.miniName}>{'@' + user.nickname}</h4>
        </div>

        <div className={styles.topPart}>
          <textarea
            className={styles.textArea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className={styles.selectedFiles}>
            {selectedFiles.map((file, i) => (
              <div key={i} className={styles.fileItem}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className={styles.previewImage}
                />
                <span className={styles.fileName}>{file.name}</span>
                <button
                  type="button"
                  className={styles.removeFileButton}
                  onClick={() =>
                    setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.bottomPart}>
          <button
            type="button"
            className={styles.uploadImageButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedFiles.length >= 10}
            title={selectedFiles.length >= 10 ? "Maximum 10 photos allowed" : "Add photos"}
          >
            <ImageIcon /> Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileSelect}
          />


          {!groupId && (
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
                <>
                  {/* Backdrop */}
                  <div
                    className={styles.dropdownBackdrop}
                    onClick={() => setShowPrivacyDropdown(false)}
                  />

                  <div className={styles.privacyDropdown}>
                    {privacyOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.privacyOption} ${privacy === opt.value ? styles.active : ''}`}
                        onClick={() => {
                          setPrivacy(opt.value);
                          setShowPrivacyDropdown(false);
                          if (opt.value === 'restricted') setShowAddFriends(true);
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
                </>
              )}
            </div>
          )}

          {/* Add friends (restricted mode) */}
          {showAddFriends && (
            <div className={styles.addFriendsPopup}>
              <AddFriends
                title="Allowed followers"
                desc="Choose who can see"
                groupId="0"
                purpose="post"
                onComplete={(ids) => {
                  setSelectedFollowers(ids);
                  setShowAddFriends(false);
                }}
                onClose={() => setShowAddFriends(false)}
              />
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            className={styles.actionButton}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}

export function TopPart() {
  const { state } = useUserStats();

  return (
    <>
      <div className={styles.leftPart}>
        <AvatarHolder avatarId={state.avatarId ?? null} size={60} />

        <div className={styles.userInfo}>
          <div className={styles.miniHandle}>{state.nickname}</div>
          <h4 className={styles.miniName}>{state.firstName + ' ' + state.lastName}</h4>
        </div>

        <div className={styles.topPart}>
          <textarea
            name="content"
            placeholder="What's on your mind?"
            className={styles.textArea}
            required
            minLength={1}
          />
        </div>
      </div >
    </>
  )
}