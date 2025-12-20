'use client'
import React, { useState } from "react"
import { GroupService } from "./group_page.services"
import styles from "./createvent.module.css"

type RsvpOption = 'going' | 'not_going' 

export default function CreateRSVP({
  groupId,
  eventId,
}: {
  groupId: number
  eventId: number
}) {
  const [isGoing, setIsGoing] = useState<RsvpOption>()

  const handleCreateRsvp = async (option: RsvpOption) => {
    setIsGoing(option)
    const response = await GroupService.rsvpToEvent(
      groupId,
      eventId,
      option
    )
    if (!response?.message) {
      console.error('RSVP failed')
    }
  }

  return (
    <div className={styles.rsvpContainer}>
      {/* Status Display */}
      <div className={styles.statusDisplay}>
        <div className={styles.statusGoing}>
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{isGoing === 'going' ? '1' : '0'} Going</span>
        </div>
        <div className={styles.statusNotGoing}>
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{isGoing === 'not_going' ? '1' : '0'} Not Going</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonContainer}>
        <button
          onClick={() => handleCreateRsvp('going')}
          className={`${styles.button} ${isGoing === 'going' ? styles.buttonGoingActive : styles.buttonInactive}`}
        >
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Going
        </button>
        
        <button
          onClick={() => handleCreateRsvp('not_going')}
          className={`${styles.button} ${isGoing === 'not_going' ? styles.buttonNotGoingActive : styles.buttonInactive}`}
        >
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Not Going
        </button>
      </div>
    </div>
  )
}