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