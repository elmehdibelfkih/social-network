import {Event} from './types'
import { CalendarIcon, ClockIcon } from "@/components/ui/icons"
import styles from "./event.module.css"
import CreateRSVP from "./group_event.client"
import {GroupService} from "./group_page.services"

const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en', { month: 'short' });
    const day = date.getDate();
    const fullDate = date.toLocaleDateString('en-US');
    const time = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    return { month, day, fullDate, time };
};

const getEventStatus = (startAt: string, endAt: string) => {
    const now = new Date();
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    
    if (now > endDate) {
        return 'expired'; // Event has ended
    } else if (now >= startDate && now <= endDate) {
        return 'ongoing'; // Event is happening now
    } else {
        return 'upcoming'; // Event hasn't started yet
    }
};

export default async function GroupEventsCard({ events, groupId }: { events: Event[], groupId: number }) {
    // Separate events by status
    const upcomingEvents = events.filter(event => {
        const status = getEventStatus(event.startAt, event.endAt);
        return status === 'upcoming';
    });

    const ongoingEvents = events.filter(event => {
        const status = getEventStatus(event.startAt, event.endAt);
        return status === 'ongoing';
    });

    const expiredEvents = events.filter(event => {
        const status = getEventStatus(event.startAt, event.endAt);
        return status === 'expired';
    });

    return (
        <>
            {/* Ongoing Events */}
            {ongoingEvents.length > 0 && (
                <div className={styles.eventsSection}>
                    <h3 className={styles.sectionTitle}>Happening Now 🔴</h3>
                    <div className={styles.eventsContainer}>
                        {ongoingEvents.map((event) => {
                            const { month, day, fullDate, time } = formatEventDate(event.startAt);
                            return (
                                <div key={event.event_id} className={`${styles.eventCard} ${styles.ongoingEvent}`}>
                                    <div className={`${styles.eventDateBadge} ${styles.ongoingBadge}`}>
                                        <p className={styles.eventDateMonth}>{month}</p>
                                        <p className={styles.eventDateDay}>{day}</p>
                                    </div>
                                    <div className={styles.eventDetails}>
                                        <div className={styles.eventTitleRow}>
                                            <h3 className={styles.eventTitle}>{event.title}</h3>
                                            <span className={styles.ongoingLabel}>LIVE</span>
                                        </div>
                                        <p className={styles.eventDescription}>{event.description}</p>
                                        <div className={styles.eventMeta}>
                                            <div className={styles.eventMetaItem}>
                                                <CalendarIcon />
                                                <span>{fullDate}</span>
                                            </div>
                                            <div className={styles.eventMetaItem}>
                                                <ClockIcon/>
                                                <span>{time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.cannotRsvp}>
                                        <p>Event in progress</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div className={styles.eventsSection}>
                    <h3 className={styles.sectionTitle}>Upcoming Events</h3>
                    <div className={styles.eventsContainer}>
                        {upcomingEvents.map((event) => {
                            const { month, day, fullDate, time } = formatEventDate(event.startAt);
                            return (
                                <div key={event.event_id} className={styles.eventCard}>
                                    <div className={styles.eventDateBadge}>
                                        <p className={styles.eventDateMonth}>{month}</p>
                                        <p className={styles.eventDateDay}>{day}</p>
                                    </div>
                                    <div className={styles.eventDetails}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        <p className={styles.eventDescription}>{event.description}</p>
                                        <div className={styles.eventMeta}>
                                            <div className={styles.eventMetaItem}>
                                                <CalendarIcon />
                                                <span>{fullDate}</span>
                                            </div>
                                            <div className={styles.eventMetaItem}>
                                                <ClockIcon/>
                                                <span>{time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <CreateRSVP eventId={event.event_id} groupId={groupId}/>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Expired Events */}
            {expiredEvents.length > 0 && (
                <div className={styles.eventsSection}>
                    <h3 className={styles.sectionTitle}>Past Events</h3>
                    <div className={styles.eventsContainer}>
                        {expiredEvents.map((event) => {
                            const { month, day, fullDate, time } = formatEventDate(event.startAt);
                            return (
                                <div key={event.event_id} className={`${styles.eventCard} ${styles.expiredEvent}`}>
                                    <div className={`${styles.eventDateBadge} ${styles.expiredBadge}`}>
                                        <p className={styles.eventDateMonth}>{month}</p>
                                        <p className={styles.eventDateDay}>{day}</p>
                                    </div>
                                    <div className={styles.eventDetails}>
                                        <div className={styles.eventTitleRow}>
                                            <h3 className={styles.eventTitle}>{event.title}</h3>
                                            <span className={styles.expiredLabel}>EXPIRED</span>
                                        </div>
                                        <p className={styles.eventDescription}>{event.description}</p>
                                        <div className={styles.eventMeta}>
                                            <div className={styles.eventMetaItem}>
                                                <CalendarIcon />
                                                <span>{fullDate}</span>
                                            </div>
                                            <div className={styles.eventMetaItem}>
                                                <ClockIcon/>
                                                <span>{time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.cannotRsvp}>
                                        <p>Event ended</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No Events */}
            {events.length === 0 && (
                <div className={styles.noEvents}>
                    <p>No events scheduled yet</p>
                </div>
            )}
        </>
    );
}