'use client';

import { useState, useRef } from 'react';
import styles from './styles.module.css';
import { ImageIcon, GlobeIcon, DropdownIcon, LockIcon, UsersIcon } from '@/components/ui/icons';
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client';
import AddFriends from '@/components/ui/AddFriends/addFriends';
import { postsService } from './services/postsService';
import type { PrivacyLevel } from './types';
import { useAuth } from '@/providers/authProvider';

const privacyOptions = [
  {
    value: 'public' as PrivacyLevel,
    label: 'Public',
    description: 'Anyone can see this post',
    icon: 'globe'
  },
  {
    value: 'followers' as PrivacyLevel,
    label: 'Followers',
    description: 'Only your followers can see',
    icon: 'users'
  },
  {
    value: 'private' as PrivacyLevel,
    label: 'Private',
    description: 'Only you can see this',
    icon: 'lock'
  },
  {
    value: 'restricted' as PrivacyLevel,
    label: 'Restricted',
    description: 'Only share with...',
    icon: 'users'
  }
] as const;

export function NewPost() {
  const { user } = useAuth()
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyLevel>('public');
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setContent('');
    setSelectedFiles([]);
    setPrivacy('public');
    setSelectedFollowers([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);

    // try {
      let mediaIds: number[] = [];

      if (selectedFiles.length > 0) {
        console.log('📤 Uploading media files...');
        const uploadPromises = selectedFiles.map(file => postsService.uploadMedia(file));
        const uploadResults = await Promise.all(uploadPromises);
        mediaIds = uploadResults.map(result => result.mediaId);
        console.log('✅ Media uploaded:', mediaIds);
      }

      console.log('📤 Creating post with privacy:', privacy);

      await postsService.createPost({
        content: content.trim(),
        privacy: privacy,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
        allowedList: privacy === 'restricted' && selectedFollowers.length > 0 ? selectedFollowers : undefined
      });

      resetForm();
    // } catch (error) {
    //   alert('Failed to create post. Please try again.'+ error.toString());
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const getPrivacyIcon = () => {
    const option = privacyOptions.find(opt => opt.value === privacy);
    switch (option?.icon) {
      case 'globe': return <GlobeIcon fillColor="#737373" />;
      case 'lock': return <LockIcon />;
      case 'users': return <UsersIcon />;
      default: return <GlobeIcon fillColor="#737373" />;
    }
  };

  const getCurrentPrivacyOption = () => {
    return privacyOptions.find(opt => opt.value === privacy) || privacyOptions[0];
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.leftPart}>
        <AvatarHolder avatarId={user.avatarId} size={48} />
      </div>

      <div className={styles.rightPart}>
        <div className={styles.topPart}>
          <textarea
            placeholder="What's on your mind?"
            className={styles.textArea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {privacy !== 'public' && (
          <div className={styles.privacyBadge} data-privacy={privacy}>
            <span className={styles.privacyBadgeIcon}>
              {privacy === 'private' ? '🔒' : privacy === 'restricted' ? '🔐' : '👥'}
            </span>
            <span>{getCurrentPrivacyOption().description}</span>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className={styles.selectedFiles}>
            {selectedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <span className={styles.fileName}>📎 {file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className={styles.removeFileButton}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.bottomPart}>
          <button
            className={styles.uploadImageButton}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <ImageIcon />
            <span>Photo</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isSubmitting}
          />

          <div className={styles.privacyContainer}>
            <button
              className={styles.privacyButton}
              type="button"
              onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
              disabled={isSubmitting}
            >
              {getPrivacyIcon()}
              <span>{getCurrentPrivacyOption().label}</span>
              <DropdownIcon />
            </button>

            {showPrivacyDropdown && (
              <>
                <div
                  className={styles.dropdownBackdrop}
                  onClick={() => setShowPrivacyDropdown(false)}
                />
                <div className={styles.privacyDropdown}>
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPrivacy(option.value);
                        setShowPrivacyDropdown(false);

                        if (option.value === 'restricted') {
                          setShowAddFriends(true);
                        } else {
                          setShowAddFriends(false);
                        }
                      }}
                      className={`${styles.privacyOption} ${privacy === option.value ? styles.active : ''
                        }`}
                    >
                      <div className={styles.privacyOptionIcon}>
                        {option.icon === 'globe' && <GlobeIcon fillColor={privacy === option.value ? '#059669' : '#6b7280'} />}
                        {option.icon === 'lock' && <LockIcon />}
                        {option.icon === 'users' && <UsersIcon />}
                      </div>
                      <div className={styles.privacyOptionContent}>
                        <div className={styles.privacyOptionLabel}>
                          {option.label}
                        </div>
                        <div className={styles.privacyOptionDesc}>
                          {option.description}
                        </div>
                      </div>
                      {privacy === option.value && (
                        <div className={styles.privacyOptionCheck}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {privacy === 'restricted' && showAddFriends && (
            <div className={styles.addFriendsPopup}>
              <AddFriends
                title="Allowed followers"
                desc="Select allowed followers to see this publication"
                groupId={String(0)}
                purpose="post"
                onComplete={(ids) => {
                  setSelectedFollowers(ids);
                  setShowAddFriends(false);
                }}
                onClose={() => setShowAddFriends(false)}
              />
            </div>
          )}

          <button
            className={styles.actionButton}
            type="submit"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form >
  );
}
