// group_page.services.ts
// Minimal service stubs for group_page
import { http } from "@/libs/apiFetch"

import {GroupMember,GroupMembersResponse} from './types'

export const GroupService = {


async getGroupMembers(groupId: number, limit = 10, lastItemId?: number): Promise<GroupMember[]> {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (lastItemId !== undefined) {
      params.set("lastItemId", String(lastItemId));
    }
    
    const response = await http.get<GroupMembersResponse>(
      `/api/v1/groups/${groupId}/members?${params.toString()}`
    );
    
    console.log('group members: ', response.members);
    if (!response?.members) return [];
    
    console.log('group members: ', response.members);
    return response.members;
  } catch (error) {
    console.error(`Failed to fetch members for group ${groupId}:`, error);
    return [];
  }
},




 async fetchGroupPage(): Promise<null> {

  
  // replace with real API call
  return null;
}
}