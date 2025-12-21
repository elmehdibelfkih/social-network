"use client";
import { Group } from "./types";
import { UserPlusIcon, CalendarIcon, UsersIcon } from "@/components/ui/icons";
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client';
import { formattedDate } from '@/libs/helpers';
import styles from './styles.module.css';
import Link from "next/link";
import AddFriends from '@/components/ui/AddFriends/addFriends';
import { useState } from 'react';

interface GroupCardClientProps {
  groups: Group[];
}

export default function GroupCardClient({ groups }: GroupCardClientProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleInviteClick = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleClose = () => {
    setSelectedGroupId(null);
  };

  const handleComplete = (selectedUserIds: number[]) => {
    console.log('Invited users:', selectedUserIds);
    setSelectedGroupId(null);
  };

  return (
    <>
      <div className={styles.group_card}>
        {groups.map((group) => (
          <div key={group.groupId} className={styles.single_group_card}>
            <div className={styles.group_header}>
              <AvatarHolder avatarId={group.avatarId} size={120} />
            </div>
            <div className={styles.group_content}>
              <div className={styles.group_title_section}>
                <div className={styles.group_title_content}>
                  <h3 className={styles.groupcardtitle}>{group.title}</h3>
                  <p className={styles.groupdescription}>{group.description}</p>
                </div>
              </div>
              <div className={styles.group_memberCount}>
                <div className={styles.member_info}>
                  <UsersIcon />
                  {group.memberCount} members
                </div>
              </div>
              {group.events && group.events.length > 0 && (
                <div>
                  {group.events.map((event) => (
                    <div key={event.event_id} className={styles.single_event}>
                      <CalendarIcon />
                      <div className={styles.event_details}>
                        <p>{event.title}</p>
                        <small>{formattedDate(event.startAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.group_actions}>
                <Link
                  href={`/groups/${group.groupId}/posts`}
                  className={styles.btn_view_group}
                >
                  View Group
                </Link>
                <button 
                  className={styles.btn_invite}
                  onClick={() => handleInviteClick(group.groupId.toString())}
                >
                  <UserPlusIcon />
                  Invite Users
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGroupId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <AddFriends
              title="Invite Users to Group"
              desc="Select followers to invite to this group"
              componentId={selectedGroupId}
              purpose="group"
              onComplete={handleComplete}
              onClose={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}