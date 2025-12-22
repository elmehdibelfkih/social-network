import { GroupService } from "@/features/group_card/group_card.services";
import GroupEventsCard from "@/features/group_page/group_event.server"
import EventPageClient from "./event_page.client"

export default async function EventPage({ params }) {
    const { id } = await params;
    const groupId = Number(id)
    const events = await GroupService.getGroupEvents(groupId)
    
    return (
        <EventPageClient 
            events={events} 
            groupId={groupId}
            groupIdString={id}
        >
            <GroupEventsCard events={events} groupId={groupId} />
        </EventPageClient>
    );
}