'use client'

import { useState, useRef } from 'react';
import styles from './styles.module.css';
import { ImageIcon, GlobeIcon, DropdownIcon } from '../../components/ui/icons';
import { postsService } from '../posts/services/postsService';
import { Post } from '../posts/types';

interface NewPostProps {
    userAvatar: string;
    onPostCreated?: (post: Post) => void;
}

export function NewPost({ userAvatar, onPostCreated }: NewPostProps) {
    const [content, setContent] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            let mediaIds: number[] = [];
            
            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => postsService.uploadMedia(file));
                const uploadResults = await Promise.all(uploadPromises);
                mediaIds = uploadResults.map(result => result.mediaId);
            }

            const postData = await postsService.createPost({ 
                content: content.trim(), 
                privacy: privacy,
                mediaIds: mediaIds.length > 0 ? mediaIds : undefined
            });
            
            const newPost: Post = {
                postId: postData.postId,
                authorId: postData.authorId,
                authorFirstName: 'Current',
                authorLastName: 'User',
                content: content.trim(),
                privacy: privacy,
                mediaIds: postData.mediaIds,
                isLikedByUser: false,
                stats: { reactionCount: 0, commentCount: 0 },
                createdAt: postData.createdAt,
                updatedAt: postData.createdAt
            };
            
            onPostCreated?.(newPost);
            setContent("");
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Failed to post:", error);
            alert("Failed to create post");
        }
    };


    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.leftPart}>
                <img className={styles.avatar} src={userAvatar} />
            </div>
            <div className={styles.rightPart}>
                <div className={styles.topPart}>
                    <textarea placeholder="what's on your mind?" className={styles.textArea} value={content}
                        onChange={(e) => setContent(e.target.value)} />
                </div>
                <div className={styles.bottomPart}>
                    <button className={styles.uploadImageButton} type='button' onClick={() => fileInputRef.current?.click()}>
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
                    />
                    {selectedFiles.length > 0 && (
                        <div className={styles.selectedFiles}>
                            {selectedFiles.map((file, index) => (
                                <span key={index}>{file.name}</span>
                            ))}
                        </div>
                    )}
                    <div className={styles.privacyContainer}>
                        <button 
                            className={styles.privacyButton} 
                            type='button'
                            onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                        >
                            <GlobeIcon fillColor='#737373' />
                            <span>{privacy === 'public' ? 'Public' : 'private' }</span>
                            <DropdownIcon />
                        </button>
                        {showPrivacyDropdown && (
                            <div className={styles.privacyDropdown}>
                                <button 
                                    type='button'
                                    onClick={() => { setPrivacy('public'); setShowPrivacyDropdown(false); }}
                                    className={privacy === 'public' ? styles.active : ''}
                                >
                                    Public
                                </button>
                                <button 
                                    type='button'
                                    onClick={() => { setPrivacy('private'); setShowPrivacyDropdown(false); }}
                                    className={privacy === 'private' ? styles.active : ''}
                                >
                                    Private
                                </button>
                            </div>
                        )}
                    </div>
                    <button className={styles.actionButton} type='submit'>
                        Post
                    </button>
                </div>
            </div>
        </form>
    );
}
