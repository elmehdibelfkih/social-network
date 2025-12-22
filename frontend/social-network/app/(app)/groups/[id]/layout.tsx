import { ReactNode } from "react";
import { GroupService } from "@/features/group_card/group_card.services";
import GroupPageServer from '@/features/group_page/group_page.server'
import TabbedNavigation from '@/features/group_page/Tabbed_Navigation.client'
import styles from '@/features/group_page/styles.module.css'

export default async function GroupLayout({ children, params }: { children: ReactNode, params: Promise<{ id: string }> }) {
    const { id } = await params;
    const groupId = Number(id)
    const group = await GroupService.getGroup(groupId);

    return (
        <div className={styles.group_card}>
            <GroupPageServer group={group} />
            <TabbedNavigation id={id} eventCount={group.events.length} memberscount={group.memberCount} />
            {children}
        </div>
    );
}
