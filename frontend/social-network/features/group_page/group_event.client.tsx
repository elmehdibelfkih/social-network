'use client'
import React, { useState, useEffect } from "react"
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
  const [isGoing, setIsGoing] = useState<RsvpOption | null>(null)
  const [goingCount, setGoingCount] = useState(0)
  const [notGoingCount, setNotGoingCount] = useState(0)

  // Fetch RSVP data when component mounts
  useEffect(() => {
    const fetchRsvpData = async () => {
      const data = await GroupService.getEventRsvp(groupId, eventId)
      if (data) {
        setGoingCount(data.going_count)
        setNotGoingCount(data.notgoing_count)

        if (data.ami_going === true) {
          setIsGoing('going')
        } else if (data.ami_going === false) {
          setIsGoing('not_going')
        }
      }
    }
    
    fetchRsvpData()
  }, [groupId, eventId])

  const handleCreateRsvp = async (option: RsvpOption) => {
    const previousIsGoing = isGoing
    const previousGoingCount = goingCount
    const previousNotGoingCount = notGoingCount

    // Update counts optimistically
    if (previousIsGoing === 'going') {
      setGoingCount(prev => prev - 1)
    } else if (previousIsGoing === 'not_going') {
      setNotGoingCount(prev => prev - 1)
    }

    if (option === 'going') {
      setGoingCount(prev => prev + 1)
    } else {
      setNotGoingCount(prev => prev + 1)
    }

    setIsGoing(option)

    const response = await GroupService.rsvpToEvent(
      groupId,
      eventId,
      option
    )

    if (!response?.message) {
      console.error('RSVP failed')
      // Revert on failure
      setIsGoing(previousIsGoing)
      setGoingCount(previousGoingCount)
      setNotGoingCount(previousNotGoingCount)
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
          <span>{goingCount} Going</span>
        </div>
        <div className={styles.statusNotGoing}>
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{notGoingCount} Not Going</span>
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