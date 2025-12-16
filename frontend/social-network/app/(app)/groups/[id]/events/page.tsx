import { GroupService } from "@/features/group_card/group_card.services";



export default async function EventPage({ params }){
    const { id } = await params;
    const groupId = Number(id)
    const events = await GroupService.getGroupEvents(groupId)
    return (
        <>
            <div>{events.length}</div>
            {events.map( (event) => {
                <div>{event.startAt}</div>
            })}
        </>
    );
}

