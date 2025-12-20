// types.ts
// Local types for group_page

export type GroupPage = {
  // add fields
};

export type  GroupMember = {
  user_id: number;
  full_name: string;
  role: string;
  joined_at: string;
};

export type  GroupMembersResponse = {
    Limit: number;
    group_id: number;
    members: GroupMember[];
};

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


export type RsvpResponse {
    message: string;
}
