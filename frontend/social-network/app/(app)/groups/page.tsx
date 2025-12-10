import GroupCardServer from "@/features/group_card/group_card.server"
import { GroupService } from "@/features/group_card/group_card.services";
import { Group } from "@/features/group_card/types"
import { log } from "console";


export default async function GroupsPage() {
  const groups: Group[] = await GroupService.getGroups(10, 0);
  console.log("jjj",groups);
  
  return (
    <div>
      <GroupCardServer groups={groups} />
    </div>
  );
}





