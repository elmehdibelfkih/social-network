import { fetchMediaClient } from "@/libs/apiFetch"
import { useEffect, useState } from "react"
import styles from './styles/chat.avatar.module.css';


export function ChatImage({ mediaId }: { mediaId: number }) {
    const [imgSrc, setImgSrc] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const media = await fetchMediaClient(String(mediaId))
                if (media?.mediaEncoded) {
                    setImgSrc(`data:image/png;base64,${media.mediaEncoded}`)
                }
            } catch (error) {
                console.error('Failed to fetch image:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchImage()
    }, [mediaId])

    if (loading) {
        return (
            <div className={styles.mediaPlaceholder}>
                <div className={styles.mediaSpinner}></div>
            </div>
        )
    }

    if (!imgSrc) {
        return (
            <div className={styles.mediaError}>
                Image not available
            </div>
        )
    }

    return (
        <img
            src={imgSrc}
            alt="Post media"
            className={styles.mediaImage}
        />
    )
}