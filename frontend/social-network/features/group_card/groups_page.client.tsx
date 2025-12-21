"use client";
import { useState } from "react";
import CreateGroupModal from "./creat_group.client";
import GroupCardClient from "./group_card.client";
import { GroupService } from "./group_card.services";
import { Group, CreateGroupPayload } from "./types";
import styles from './styles.module.css';

interface GroupsPageClientProps {
  initialGroups: Group[];
}

export default function GroupsPageClient({ initialGroups }: GroupsPageClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleSubmit(payload: CreateGroupPayload) {
    try {
      const newGroup = await GroupService.createGroup(payload);
      console.log("Group created:", newGroup);
      
      // Refresh the groups list
      setIsRefreshing(true);
      const updatedGroups = await GroupService.getGroups(10, 0);
      setGroups(updatedGroups);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      // Handle error appropriately (show toast, alert, etc.)
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div>
      <button className={styles.btn_creat_group} onClick={() => setIsOpen(true)}>
        Create Group
      </button>
      <CreateGroupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
      {isRefreshing && <div className={styles.loading}>Refreshing groups...</div>}
      <GroupCardClient groups={groups} />
    </div>
  );
}