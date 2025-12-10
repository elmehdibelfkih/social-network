import { http } from "@/libs/apiFetch"
import { Group, GroupsResponse, CreateGroupPayload, JoinGroupResponse , GroupEventsResponse , Event } from "./types"
import { group, log } from "console";
import { getgroups } from "process";

// group_card.services.ts
// Minimal service stubs for group_card


export const GroupService = {


async getGroupEvents(groupId: number): Promise<Event[]> {
  try {
    const response = await http.get<GroupEventsResponse>(`/api/v1/groups/${groupId}/events`);
    if (!response?.events) return [];
    return response.events;
  } catch (error) {
    console.error(`Failed to fetch events for group ${groupId}:`, error);
    return [];
  }
},

async getGroups(limit = 10, lastItemId?: number): Promise<Group[]> {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (lastItemId) params.set("lastItemId", String(lastItemId));
    const response = await http.get<GroupsResponse>(`/api/v1/groups/?${params.toString()}`);
    if (!response?.groups) return [];
    const groupsWithEvent = await Promise.all(
      response.groups.map(async (grp) => {
        const events = await this.getGroupEvents(grp.groupId);
        return { ...grp, events };
      })
    );

    console.log('groups with events: ', groupsWithEvent);

    return groupsWithEvent; 
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }
},



  async createGroup(data: CreateGroupPayload): Promise<Group | null> {
    try {
      const response = await http.post<Group>(
        '/api/v1/group',
        data,
        {
          throwOnError: false, // Handle errors gracefully
          redirectOnError: false // Don't redirect on error
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to create group:', error);
      return null;
    }
  },

  async joinGroup(groupId: number): Promise<JoinGroupResponse | null> {
    try {
      const response = await http.post<JoinGroupResponse>(
        `/api/v1/groups/${groupId}/join`,
        undefined,
        {
          throwOnError: false,
          redirectOnError: false
        }
      );

      return response;
    } catch (error) {
      console.error('Failed to join group:', error);
      return null;
    }
  },







  async fetchGroup(limit = 10,): Promise<null> {
    // replace with real API call


    return null;
  }


}
