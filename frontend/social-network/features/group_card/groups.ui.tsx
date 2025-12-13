// features/group_card/groups.ui.tsx
"use client";

import { useState } from "react";
import CreateGroupModal from "./creat_group.client";
import { GroupService } from "./group_card.services"

export default function GroupsUI() {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUploadAvatar(file: File): Promise<number> {
    let mediaId: number;
    try {
      if (file) {
        const uploaded = await GroupService.uploadMedia(file)
        mediaId = uploaded.mediaId
      }
    } catch {
      console.log("uploading file", file);
    }
  
   // console.log("uploading file", file);
    return mediaId; // fake avatarId for now
  }

  function handleSubmit(payload) {
    const creat = GroupService.createGroup(payload)
    console.log("create group payload", creat);
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
