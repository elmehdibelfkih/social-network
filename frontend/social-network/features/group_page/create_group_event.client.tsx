'use client'
import { useState } from 'react'
import { GroupService } from '@/features/group_page/group_page.services'
import styles from './createvent.module.css'

interface CreateGroupEventProps {
    groupId: string
    onComplete?: () => void
    onClose?: () => void
}

export default function CreateGroupEvent({ groupId, onComplete, onClose }: CreateGroupEventProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endDate, setEndDate] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const validateDateTime = () => {
        if (!startDate || !startTime || !endDate || !endTime) {
            return 'Please fill in all date and time fields'
        }

        const startDateTime = new Date(`${startDate}T${startTime}`)
        const endDateTime = new Date(`${endDate}T${endTime}`)

        // Check if end time is after start time
        if (endDateTime <= startDateTime) {
            return 'End date and time must be after start date and time'
        }

        // Check if there's at least 30 minutes difference
        const diffInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)
        if (diffInMinutes < 30) {
            return 'Event must be at least 30 minutes long'
        }

        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        
        if (!title || !description || !startDate || !startTime || !endDate || !endTime || !location) {
            setError('Please fill in all fields')
            return
        }

        // Validate date and time
        const validationError = validateDateTime()
        if (validationError) {
            setError(validationError)
            return
        }

        setIsSubmitting(true)

        try {
            // Combine date and time into ISO format with Z (UTC)
            const startDateTime = `${startDate}T${startTime}:00Z`
            const endDateTime = `${endDate}T${endTime}:00Z`
            
            const response = await GroupService.createGroupEvent(Number(groupId), {
                title,
                description,
                startAt: startDateTime,
                endAt: endDateTime,
                location
            })

            if (response) {
                // Reset form
                setTitle('')
                setDescription('')
                setStartDate('')
                setStartTime('')
                setEndDate('')
                setEndTime('')
                setLocation('')
                setError('')

                if (onComplete) {
                    onComplete()
                }
            } else {
                setError('Failed to create event. Please try again.')
            }
        } catch (error) {
            console.error('Failed to create event:', error)
            setError('Failed to create event. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
                <div>
                    <h2 className={styles.modalTitle}>Create Group Event</h2>
                    <p className={styles.modalDesc}>Organize an event for your group members</p>
                </div>
                {onClose && (
                    <button 
                        className={styles.closeBtn} 
                        onClick={onClose}
                        type="button"
                    >
                        ×
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Event Title <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter event title"
                        className={styles.input}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        placeholder="What's this event about?"
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Start Date <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="date"
                            className={styles.input}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Start Time <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="time"
                            className={styles.input}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            End Date <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="date"
                            className={styles.input}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            End Time <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="time"
                            className={styles.input}
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Location <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Group voice room, Main Hall, Online"
                        className={styles.input}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
            </form>
        </div>
    )
}