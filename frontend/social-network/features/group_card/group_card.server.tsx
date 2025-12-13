import { ReactNode  } from "react";
import { GroupService } from "./group_card.services"
import { Group } from "./types"
import { UserPlusIcon, CalendarIcon, UsersIcon } from "@/components/ui/icons"
import { AvatarHolder } from '@/components/ui/avatar_holder/avatarholder.client'
import { formattedDate } from '@/libs/helpers'
import styles from './styles.module.css';
import GroupsUI from '@/features/group_card/groups.ui'



interface GroupCardServerProps {
  children?: ReactNode;
}

export default async function GroupCardServer({ groups }: { groups: Group[] }) {
  // const [isModalOpen, setIsModalOpen] = useState(false);


  return (
<>
 <div className={styles.group_card}>
  
  {groups.map((group) => (
    <div key={group.groupId} className={styles.single_group_card}>
      {/* Purple Header - gradient from purple to light purple */}
      <div className={styles.group_header}>   <AvatarHolder avatarId={group.avatarId} size={120}/></div>
   
      
      {/* Content with p-6 padding */}
      <div className={styles.group_content}>
        {/* Title Section */}
        <div className={styles.group_title_section}>
          <div className={styles.group_title_content}>
            <h3 className={styles.groupcardtitle}>{group.title}</h3>
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

        {/* Events Section - bg-[#f5e6dc] rounded-lg p-3 mb-4 */}
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

        {/* Action Buttons - space-y-2 */}
        <div className={styles.group_actions}>
          <button className={styles.btn_view_group}>View Group</button>
          <button className={styles.btn_invite}>
            <UserPlusIcon />
            Invite Users
          </button>
        </div>
      </div>
    </div>
  ))}


  {/* <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
        onUploadAvatar={handleUploadAvatar}
  /> */}
</div>
</>
  );
}
