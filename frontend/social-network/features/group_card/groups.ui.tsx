// features/group_card/groups.ui.tsx
"use client";

import { useState } from "react";
import CreateGroupModal from "./creat_group.client";

export default function GroupsUI() {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUploadAvatar(file: File): Promise<number> {
    // later: call API / server action
    console.log("uploading file", file);
    return 1; // fake avatarId for now
  }

  function handleSubmit(payload) {
    console.log("create group payload", payload);
    setIsOpen(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Create Group
      </button>

      <CreateGroupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        onUploadAvatar={handleUploadAvatar}
      />
    </>
  );
}
