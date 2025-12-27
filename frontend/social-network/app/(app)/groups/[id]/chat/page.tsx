import { GroupService } from "@/features/group_card/group_card.services";
import GroupChatConversation from "@/features/chat/chat.group.conversation.client";

export default async function ChatPage({ params }) {
    const { id } = await params;
    const groupId = Number(id)
    const group = await GroupService.getGroup(groupId)
    

    return (
        <GroupChatConversation group={group} chatId={group.chatId} />
    );
}