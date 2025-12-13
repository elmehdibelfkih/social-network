'use client'
import { useState } from 'react'
import styles from './styles.module.css'

export function MediaCarousel({ mediaDataList }: { mediaDataList: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (mediaDataList.length === 0) return null

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaDataList.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaDataList.length) % mediaDataList.length)
  }

  return (
    <div className={styles.mediaCarousel}>
      <img
        src={mediaDataList[currentIndex]}
        alt="Post media"
        className={styles.mediaImage}
      />
      {mediaDataList.length > 1 && (
        <>
          <button className={styles.carouselBtnPrev} onClick={goToPrev}>
            ‹
          </button>
          <button className={styles.carouselBtnNext} onClick={goToNext}>
            ›
          </button>
          <div className={styles.carouselDots}>
            {mediaDataList.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
