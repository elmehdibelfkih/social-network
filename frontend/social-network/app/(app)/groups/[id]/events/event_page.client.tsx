'use client'
import { useState } from 'react'
import CreateGroupEvent from "@/features/group_page/create_group_event.client"
import styles from '@/features/group_page/styles.module.css'

interface EventPageClientProps {
    events: any[]
    groupId: number
    groupIdString: string
    children: React.ReactNode // This will be the GroupEventsCard
}

export default function EventPageClient({ events, groupId, groupIdString, children }: EventPageClientProps) {
    const [showCreateEvent, setShowCreateEvent] = useState(false)

    const handleEventCreated = () => {
        setShowCreateEvent(false)
        window.location.reload() // Refresh to show new event
    }

    return (
        <>
            <div className={styles.eventHeader}>
                <h2>Group Events</h2>
                <button 
                    className={styles.createEventBtn}
                    onClick={() => setShowCreateEvent(true)}
                >
                    Create Event
                </button>
            </div>

            {children}

            {showCreateEvent && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateEvent(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <CreateGroupEvent
                            groupId={groupIdString}
                            onComplete={handleEventCreated}
                            onClose={() => setShowCreateEvent(false)}
                        />
                    </div>
                </div>
            )}
        </>
    )
}