import { GroupService } from "@/features/group_card/group_card.services";
import GroupsPageClient from "@/features/group_card/groups_page.client";

export default async function GroupsPage() {
  const [initialMyGroups, initialDiscoverGroups] = await Promise.all([
    GroupService.getMyGroups(10, 0),
    GroupService.getOthersGroups(10, 0)
  ]);

  return (
    <GroupsPageClient 
      initialMyGroups={initialMyGroups}
      initialDiscoverGroups={initialDiscoverGroups}
    />
  );
}