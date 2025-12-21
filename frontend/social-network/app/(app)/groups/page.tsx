import { GroupService } from "@/features/group_card/group_card.services";
import GroupsPageClient from "@/features/group_card/groups_page.client";

export default async function GroupsPage() {
  const initialGroups = await GroupService.getGroups(10, 0);
  
  return <GroupsPageClient initialGroups={initialGroups} />;
}
