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
  isMyGroups: boolean;
  onJoinGroup: (groupId: number) => void;
}

export default function GroupCardClient({ groups, isMyGroups, onJoinGroup }: GroupCardClientProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  const handleInviteClick = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleClose = () => {
    setSelectedGroupId(null);
  };

  const handleComplete = (selectedUserIds: number[]) => {
    // console.log('Invited users:', selectedUserIds);
    setSelectedGroupId(null);
  };

  const handleJoinClick = async (groupId: number) => {
    setJoiningGroupId(groupId);
    try {
      await onJoinGroup(groupId);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const getNextEvent = (events: Group['events']) => {
    if (!events || events.length === 0) return null;

    const now = new Date();
    
    const activeEvents = events.filter(event => {
      const endDate = new Date(event.endAt);
      return endDate >= now;
    });

    if (activeEvents.length === 0) return null;

    return activeEvents.sort((a, b) => 
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
  };

  const isEventLive = (startAt: string, endAt: string) => {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);
    return now >= start && now <= end;
  };

  return (
    <>
      <div className={styles.group_card}>
        {groups.map((group) => {
          const nextEvent = getNextEvent(group.events);
          
          return (
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
                {nextEvent && (
                  <div className={styles.single_event}>
                    <CalendarIcon />
                    <div className={styles.event_details}>
                      <p>{nextEvent.title}</p>
                      <small>
                        {formattedDate(nextEvent.startAt)}
                        {isEventLive(nextEvent.startAt, nextEvent.endAt) && (
                          <span className={styles.liveBadge}> • Live Now</span>
                        )}
                      </small>
                    </div>
                  </div>
                )}
                <div className={styles.group_actions}>
                  {isMyGroups ? (
                    <>
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
                    </>
                  ) : (
                    group.status === 'pending' ? (
                      <button className={styles.btn_pending} disabled>
                        Request Sent
                      </button>
                    ) : group.status === 'declined' ? (
                      <button className={styles.btn_declined} disabled>
                        Request Declined
                      </button>
                    ) : (
                      <button 
                        className={styles.btn_join_group}
                        onClick={() => handleJoinClick(group.groupId)}
                        disabled={joiningGroupId === group.groupId}
                      >
                        {joiningGroupId === group.groupId ? 'Joining...' : 'Join Group'}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
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