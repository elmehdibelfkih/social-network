import React from 'react';
import styles from '@/components/ui/group-card/group-card.module.css'
import { CalendarIcon, ProfileIcon, GroupsIcon, UserPlusIcon } from '@/components/ui/icons';
import AvatarHolder from '../avatar_holder/avatarholder.client';
import { Group } from '@/features/search/types';

interface GroupCardProps {
  group: Group;
  onJoinGroup: (groupId: number) => void;
  onViewGroup: (groupId: number) => void;
  onInviteUsers: (groupId: number) => void;
}

export function GroupCard({ group, onJoinGroup, onViewGroup, onInviteUsers }: GroupCardProps) {
  const isJoined = group.status === 'accepted';

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    );
  };

  return (
    <div className={styles.groupcard}>
      <div className={styles.groupCardHeader}></div>

      <div className={styles.groupCardContent}>
        <AvatarHolder avatarId={group.avatarId} />
        <h3 className={styles.groupCardTitle}>{group.title}</h3>

        <p className={styles.groupCardDescription}>
          {group.description}
        </p>

        <div className={styles.groupCardMembers}>
          <GroupsIcon />
          <span className={styles.groupCardMembersText}>
            {group.memberCount}{' '}
            {group.memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        {group.upcomingEvent && (
          <div className={styles.groupCardEvent}>
            <div className={styles.groupCardEventContent}>
              <CalendarIcon />
              <div>
                <h4 className={styles.groupCardEventTitle}>
                  {group.upcomingEvent.title}
                </h4>
                <p className={styles.groupCardEventDate}>
                  {formatEventDate(group.upcomingEvent.date)}
                </p>
              </div>
            </div>
          </div>
        )}

        {isJoined ? (
          <div className={styles.groupCardButtons}>
            {/* View Group */}
            <button
              onClick={() => onViewGroup(group.groupId)}
              className={`${styles.groupCardBtn} ${styles.groupCardBtnPrimary}`}
            >
              View Group
            </button>

            <button
              onClick={() => onInviteUsers(group.groupId)}
              className={`${styles.groupCardBtn} ${styles.groupCardBtnSecondary}`}
            >
              <UserPlusIcon />
              Invite Users
            </button>
          </div>
        ) : (
          <button
            onClick={() => onJoinGroup(group.groupId)}
            className={`${styles.groupCardBtn} ${styles.groupCardBtnJoin}`}
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};
