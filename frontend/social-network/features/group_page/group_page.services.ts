// group_page.services.ts
// Minimal service stubs for group_page
import { http } from "@/libs/apiFetch"

import {GroupMember,GroupMembersResponse , RsvpResponse , EventRsvpResponse} from './types'

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


async getEventRsvp(groupId: number, eventId: number): Promise<EventRsvpResponse | null> {
  try {
    const response = await http.get<EventRsvpResponse>(
      `/api/v1/groups/${groupId}/events/${eventId}/rsvp`
    );
    
    console.log('event rsvp: ', response);
    
    if (!response) return null;
    
    return response;
  } catch (error) {
    console.error(`Failed to fetch RSVP for event ${eventId} in group ${groupId}:`, error);
    return null;
  }
},

async rsvpToEvent(
  groupId: number,
  eventId: number,
  option: 'going' | 'not_going'
): Promise<RsvpResponse | null> {
  try {
    const response = await http.post<RsvpResponse>(
      `/api/v1/groups/${groupId}/events/${eventId}/rsvp`,
      {
        option
      },
      {
        throwOnError: false, 
        redirectOnError: false 
      }
    );
    console.log("this is RSVP ",response)

    return response;

  } catch (error) {
    console.error('Failed to RSVP to event:', error);
    return null;
  }
},




 async fetchGroupPage(): Promise<null> {

  
  // replace with real API call
  return null;
}
}