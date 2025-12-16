import { ReactNode } from "react";
import { GroupService } from "@/features/group_card/group_card.services";
import { Group } from "@/features/group_card/types"
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import GroupPageServer from '@/features/group_page/group_page.server'
import TabbedNavigation from '@/features/group_page/Tabbed_Navigation.client'

export default async function GroupLayout({ children, params }: { children: ReactNode, params: Promise<{ id: string }> }) {
    const { id } = await params;
    const groupId = Number(id)
    const group: Group = await GroupService.getGroup(groupId);
   // console.log("jjj", group);
    return (
        <main className="g_layout min-h-screen bg-gray-50">
                       
            <GroupPageServer group={group} /> 
             <TabbedNavigation id={id}/>

            {children}
        </main>
    );
}
