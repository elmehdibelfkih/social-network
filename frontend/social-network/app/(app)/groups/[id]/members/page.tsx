import { GroupService } from "@/features/group_page/group_page.services"
import GroupMembersCard from "@/features/group_page/group_member.server"



export default async function PostPage({ params }){
    const { id } = await params;
    const groupId = Number(id)
    const groups = await GroupService.getGroupMembers(groupId, 10, 0)
    return (
        <>
           <GroupMembersCard groups={groups}/>
        </>
    );
}

