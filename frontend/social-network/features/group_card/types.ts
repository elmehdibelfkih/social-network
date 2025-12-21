// types.ts
// Local types for group_card

export type Event = {
  event_id: number;
  title: string;
  description: string;
  startAt: string; // ISO string
  endAt: string;   // ISO string
  location: string;
  created_by: number;
  created_at: string;
};

export type GroupEventsResponse = {
  group_id: number;
  events: Event[];
};

export type Group = {
  groupId: number;
  title: string;
  description: string;
  avatarId: number;
  creatorId: number;
  memberCount: number;
  createdAt: string;
  events: Event[];
};

export type GroupsResponse = {
    limit: number;
    totalGroups: number;
    groups: Group[];
};


export type CreateGroupPayload = {
  title: string;
  description: string;
  avatarId: number;
};

export type JoinGroupResponse = {
  message: string;
  groupId: number;
  status: 'pending' | 'approved'; // Add other statuses if needed
};


export interface MediaUploadResponse {
  mediaId: number;
  mediaPath: string;
  fileType: string;
  uploadedAt: string;
}