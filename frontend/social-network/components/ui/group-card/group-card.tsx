import React from 'react';
import { Users, Calendar, UserPlus } from 'lucide-react';
import styles from '@/components/ui/group-card/group-card.module.css'
import { CalendarIcon, ProfileIcon, GroupsIcon } from '@/components/ui/icons';

// Types
interface Group {
  groupId: number;
  title: string;
  description: string;
  avatarId?: number;
  creatorId: number;
  memberCount: number;
  status: 'accepted' | 'pending' | 'declined' | null;
  chatId?: number;
  createdAt: string;
  upcomingEvent?: {
    title: string;
    date: string;
  };
}

interface GroupCardProps {
  group: Group;
  onJoinGroup: (groupId: number) => void;
  onViewGroup: (groupId: number) => void;
  onInviteUsers: (groupId: number) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoinGroup,
  onViewGroup,
  onInviteUsers
}) => {
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
      {/* Purple Header */}
      <div className="group-card-header"></div>

      {/* Content */}
      <div className="group-card-content">
        {/* Title */}
        <h3 className="group-card-title">{group.title}</h3>

        {/* Description */}
        <p className="group-card-description">
          {group.description}
        </p>

        {/* Member Count */}
        <div className="group-card-members">
          <GroupsIcon />
          <span className="group-card-members-text">
            {group.memberCount}{' '}
            {group.memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Upcoming Event */}
        {group.upcomingEvent && (
          <div className="group-card-event">
            <div className="group-card-event-content">
              {/* <Calendar className="group-card-event-icon" /> */}
              <CalendarIcon />
              <div>
                <h4 className="group-card-event-title">
                  {group.upcomingEvent.title}
                </h4>
                <p className="group-card-event-date">
                  {formatEventDate(group.upcomingEvent.date)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {isJoined ? (
          <div className="group-card-buttons">
            {/* View Group */}
            <button
              onClick={() => onViewGroup(group.groupId)}
              className="group-card-btn group-card-btn-primary"
            >
              View Group
            </button>

            {/* Invite Users */}
            <button
              onClick={() => onInviteUsers(group.groupId)}
              className="group-card-btn group-card-btn-secondary"
            >
              <UserPlus className="btn-icon" />
              Invite Users
            </button>
          </div>
        ) : (
          <button
            onClick={() => onJoinGroup(group.groupId)}
            className="group-card-btn group-card-btn-join"
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};

// Main Component - Grid of Group Cards
interface GroupCardsProps {
  groups: Group[];
  onJoinGroup: (groupId: number) => void;
  onViewGroup: (groupId: number) => void;
  onInviteUsers: (groupId: number) => void;
}

export const GroupCards: React.FC<GroupCardsProps> = ({
  groups,
  onJoinGroup,
  onViewGroup,
  onInviteUsers
}) => {
  return (
    <div className="group-cards-grid">
      {groups.map(group => (
        <GroupCard
          key={group.groupId}
          group={group}
          onJoinGroup={onJoinGroup}
          onViewGroup={onViewGroup}
          onInviteUsers={onInviteUsers}
        />
      ))}
    </div>
  );
};

export { GroupCard };
