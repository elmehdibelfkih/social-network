'use client'

import { useState } from 'react';
import styles from './styles.module.css';
import { ImageIcon, GlobeIcon, DropdownIcon } from '../../components/ui/icons';
import { createPost } from '../../features/newPost/index';

export function NewPost({ userAvatar }: { userAvatar: string }) {
    const [content, setContent] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            await createPost({ content, privacy: 'public' }) // TODO
            setContent("")
        } catch (error) {
            console.error("Failed to post", error)
        }
    }


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
                    <button className={styles.uploadImageButton} type='button'>
                        <ImageIcon />
                        <span>Photo</span>
                    </button>
                    <button className={styles.privacyButton} type='button'>
                        <GlobeIcon fillColor='#737373' />
                        <span>Public</span>
                        <DropdownIcon />
                    </button>
                    <button className={styles.actionButton} type='submit'>
                        Post
                    </button>
                </div>
            </div>
        </form>
    );
}
