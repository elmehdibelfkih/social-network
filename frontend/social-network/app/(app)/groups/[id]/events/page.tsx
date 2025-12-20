import { GroupService } from "@/features/group_card/group_card.services";

import { UserPlusIcon, CalendarIcon, ClockIcon } from "@/components/ui/icons"
import GroupEventsCard from "@/features/group_page/group_event.server"




export default async function EventPage({ params }) {
    const { id } = await params;
    const groupId = Number(id)
    const events = await GroupService.getGroupEvents(groupId)
    return (
        <>
            <GroupEventsCard events={events} groupId={groupId} />
        </>
    );
}

