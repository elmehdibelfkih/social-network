import { http } from "@/libs/apiFetch"
import { Group, GroupsResponse, CreateGroupPayload, JoinGroupResponse, GroupEventsResponse, Event, MediaUploadResponse } from "./types"
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

      return groupsWithEvent;
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      return [];
    }
  },





  async getMyGroups(limit = 10, offset?: number): Promise<Group[]> {
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (offset) params.set("offset", String(offset));
      const response = await http.get<GroupsResponse>(`/api/v1/my_groups/?${params.toString()}`);
      if (!response?.groups) return [];
      const groupsWithEvent = await Promise.all(
        response.groups.map(async (grp) => {
          const events = await this.getGroupEvents(grp.groupId);
          return { ...grp, events };
        })
      );

      return groupsWithEvent;
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      return [];
    }
  },



  async getOthersGroups(limit = 10, offset?: number): Promise<Group[]> {
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (offset) params.set("offset", String(offset));
      const response = await http.get<GroupsResponse>(`/api/v1/others_groups/?${params.toString()}`);
      if (!response?.groups) return [];
      const groupsWithEvent = await Promise.all(
        response.groups.map(async (grp) => {
          // const events = await this.getGroupEvents(grp.groupId);
          // return { ...grp, events };
          return { ...grp };
        })
      );

      return groupsWithEvent;
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      return [];
    }
  },


  async getGroup(groupId: number): Promise<Group | null> {
    try {
      if (!groupId) return null;
      const response = await http.get<Group>(`/api/v1/groups/${groupId}`);
      if (!response) return null;
      const events = await this.getGroupEvents(groupId);
      const groupWithEvents = {
        ...response,
        events,
      };
      return groupWithEvents;
    } catch (error) {
      console.error("Failed to fetch group:", error);
      return null;
    }
  },


  async createGroup(data: CreateGroupPayload): Promise<Group | null> {
    try {
      const response = await http.post<Group>(
        '/api/v1/group',
        data,
        {
          throwOnError: false, 
          redirectOnError: false 
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


  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const payload = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileData: base64,
      purpose: 'avatar'
    };

    const response = await http.post<MediaUploadResponse>(
      '/api/v1/media/upload',
      payload
    );

    if (!response) {
      throw new Error('Failed to upload media');
    }

    return response;
  },


}
