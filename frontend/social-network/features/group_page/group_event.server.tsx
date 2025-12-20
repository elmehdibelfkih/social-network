import {Event} from './types'
import { CalendarIcon, ClockIcon } from "@/components/ui/icons"
import styles from "./event.module.css"
import CreateRSVP from "./group_event.client"


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


export default async function GroupEventsCard({ events , groupId }: { events: Event[] , groupId: number}) {
    return (
        <>
            {events && events.length > 0 && (
                <div className={styles.eventsContainer}>
                    {events.map((event) => {
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
            )}

        </>
    );
}

