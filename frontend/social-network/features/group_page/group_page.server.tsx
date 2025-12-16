// group_page.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";
import { Group } from "../group_card/types"
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import styles from "./styles.module.css";
import { UsersIcon } from "@/components/ui/icons"


export default function GroupPageServer({ group }: { group: Group }) {
   return (
    <>
      <div className={styles.group_card}>
          <div key={group.groupId} className={styles.single_group_card}>
            {/* Purple Header - gradient from purple to light purple */}
            <div className={styles.group_header}>   <AvatarHolder avatarId={group.avatarId} size={190} /></div>
            {/* Content with p-6 padding */}
            <div className={styles.group_content}>
              {/* Title Section */}
              <div className={styles.group_title_section}>
                <div className={styles.group_title_content}>
                  <h1 className={styles.groupcardtitle}>{group.title}</h1>
                  <p className={styles.groupdescription}>{group.description}</p>
                </div>
              </div>
              {/* Member Count - flex items-center justify-between */}
              <div className={styles.group_memberCount}>
                <div className={styles.member_info}>
                  <UsersIcon />
                  {group.memberCount} members
                </div>
              </div>
            </div>
          </div>
      </div>
      
    </>
  );
}

