import styles from './GroupMembers.module.css';
import { GroupMember } from './types'




export default async function GroupMembersCard({ groups }: { groups: GroupMember[] }) {
    return (
        <>
            <div className={styles.groupMembersCard}>
                <h3 className={styles.groupMembersTitle}>Group Members</h3>
                <div className={styles.membersList}>
                    {groups.map((group, index) => (
                        <div key={`${group.user_id}-${index}`} className={styles.memberItem}>
                            <div className={styles.memberInfo}>
                                <span className={styles.memberAvatar}>
                                    <div className={styles.memberAvatarContent}>
                                        {group.full_name.charAt(0).toUpperCase()}
                                    </div>
                                </span>
                                <div className={styles.memberDetails}>
                                    <p className={styles.memberName}>{group.full_name}</p>
                                    <p className={styles.memberJoined}>
                                        Joined {new Date(group.joined_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            {group.role && group.role.length > 0 && group.role !== 'member' && (
                                <span className={styles.memberRoleBadge}>
                                    {group.role.charAt(0).toUpperCase() + group.role.slice(1)}
                                </span>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

