// features/group_card/groups.ui.tsx
"use client";

import { useState } from "react";
import CreateGroupModal from "./creat_group.client";
import { GroupService } from "./group_card.services"
import styles from './styles.module.css';

export default function GroupsUI() {
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(payload) {
    const creat = GroupService.createGroup(payload)
    setIsOpen(false);
  }

  return (
    <>

      <button  className={styles.btn_creat_group} onClick={() => setIsOpen(true)}>
        Create Group
      </button>

      <CreateGroupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
